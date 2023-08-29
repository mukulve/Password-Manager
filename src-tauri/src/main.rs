// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Entry {
    username: String,
    password: String,
    url: String,
    notes: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Database {
    password: Mutex<Option<String>>,
    entries: Mutex<HashMap<String, Entry>>,
}

#[tauri::command]
fn does_db_exist(app_handle: tauri::AppHandle) -> bool {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let db_file = Path::new(&format!(
        "{}/passwords",
        &app_dir.clone().unwrap().to_str().unwrap()
    ))
    .exists();

    if app_dir.is_some() && db_file {
        return true;
    }
    return false;
}

#[tauri::command]
fn lock_db(database: tauri::State<'_, Database>) {
    *database.password.lock().unwrap() = None;
    *database.entries.lock().unwrap() = HashMap::new();
}

#[tauri::command]
fn create_db(
    app_handle: tauri::AppHandle,
    database: tauri::State<'_, Database>,
    password: String,
) -> Result<(), String> {
    *database.password.lock().map_err(|err| err.to_string())? = Some(password);

    let app_dir = app_handle.path_resolver().app_data_dir();
    let db_path = format!("{}/passwords", app_dir.unwrap().to_str().unwrap());
    let mut file = File::create(Path::new(&db_path)).map_err(|err| err.to_string())?;

    let serialized = serde_json::to_string(&(*database)).map_err(|err| err.to_string())?;

    let mc = new_magic_crypt!(
        (*database.password.lock().map_err(|err| err.to_string())?)
            .as_ref()
            .unwrap(),
        256
    );
    let encrypted = mc.encrypt_str_to_base64(serialized);

    file.write_all(encrypted.as_bytes())
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn decrypt_db(
    app_handle: tauri::AppHandle,
    database: tauri::State<'_, Database>,
    password: String,
) -> Result<(), String> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let db_path = format!("{}/passwords", app_dir.unwrap().to_str().unwrap());
    let mut file = File::open(Path::new(&db_path)).map_err(|err| err.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|err| err.to_string())?;

    let mc = new_magic_crypt!(password, 256);
    let decrypted = mc
        .decrypt_base64_to_string(contents)
        .map_err(|err| err.to_string())?;

    let deserialized: Database = serde_json::from_str(&decrypted).map_err(|err| err.to_string())?;

    *database.password.lock().map_err(|err| err.to_string())? = Some(
        deserialized
            .password
            .lock()
            .map_err(|err| err.to_string())?
            .clone()
            .unwrap(),
    );

    *database.entries.lock().map_err(|err| err.to_string())? = deserialized
        .entries
        .lock()
        .map_err(|err| err.to_string())?
        .clone();
    Ok(())
}

#[tauri::command]
fn is_db_locked(database: tauri::State<'_, Database>) -> bool {
    if database.password.lock().unwrap().is_some() {
        return false;
    }
    return true;
}

#[tauri::command]
fn add_entry(
    title: String,
    username: String,
    password: String,
    url: String,
    notes: String,
    database: tauri::State<'_, Database>,
) {
    if is_db_locked(database.clone()) {
        return;
    }

    let new_entry = Entry {
        username: username,
        password: password,
        url: url,
        notes: notes,
    };

    database.entries.lock().unwrap().insert(title, new_entry);
}

#[tauri::command]
fn change_db_password(
    database: tauri::State<'_, Database>,
    password: String,
) -> Result<(), String> {
    if is_db_locked(database.clone()) {
        return Err("Database is locked".to_string());
    }

    *database.password.lock().map_err(|err| err.to_string())? = Some(password);
    Ok(())
}

#[tauri::command]
fn delete_entry(database: tauri::State<'_, Database>, title: String) -> Result<(), String> {
    if is_db_locked(database.clone()) {
        return Err("Database is locked".to_string());
    }

    database
        .entries
        .lock()
        .map_err(|err| err.to_string())?
        .remove(&title);
    Ok(())
}

#[tauri::command]
fn encrypt_db(
    app_handle: tauri::AppHandle,
    database: tauri::State<'_, Database>,
) -> Result<(), String> {
    let app_dir = app_handle.path_resolver().app_data_dir();
    let db_path = format!("{}/passwords", app_dir.unwrap().to_str().unwrap());
    //cd /home/mukul/.local/share/com.tauri.dev
    let mut file = File::create(db_path).map_err(|err| err.to_string())?;

    let serialized = serde_json::to_string(&database.inner()).map_err(|err| err.to_string())?;

    let mc = new_magic_crypt!(
        (*database.password.lock().map_err(|err| err.to_string())?)
            .as_ref()
            .unwrap(),
        256
    );
    let encrypted = mc.encrypt_str_to_base64(serialized);

    file.write_all(encrypted.as_bytes())
        .map_err(|err| err.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_db_json(database: tauri::State<'_, Database>) -> String {
    let serialized = serde_json::to_string(&database.inner()).unwrap();
    return serialized;
}

#[tauri::command]
fn delete_all_entries(database: tauri::State<'_, Database>) {
    database.entries.lock().unwrap().clear();
}

#[tauri::command]
fn import_from_keepass(database: tauri::State<'_, Database>, path: String) {
    let mut file = File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();

    for x in contents.lines().skip(1) {
        let columns = x.split(",").collect::<Vec<&str>>();

        if columns.len() != 10 {
            continue;
        }

        let title = columns[1][1..columns[1].len() - 1].to_string();
        let username = columns[2][1..columns[2].len() - 1].to_string();
        let password = columns[3][1..columns[3].len() - 1].to_string();
        let url = columns[4][1..columns[4].len() - 1].to_string();
        let notes = columns[5][1..columns[5].len() - 1].to_string();

        let new_entry = Entry {
            username: username,
            password: password,
            url: url,
            notes: notes,
        };

        database.entries.lock().unwrap().insert(title, new_entry);
    }
}

fn main() {
    tauri::Builder::default()
        .manage(Database {
            password: Mutex::new(None),
            entries: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            does_db_exist,
            create_db,
            decrypt_db,
            is_db_locked,
            get_db_json,
            add_entry,
            encrypt_db,
            lock_db,
            change_db_password,
            delete_entry,
            import_from_keepass,
            delete_all_entries
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
