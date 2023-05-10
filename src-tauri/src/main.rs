// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use std::fs::File;
use std::io::Write;
use std::path::Path;

//Reads a encrypted file from file system
#[tauri::command]
fn read_file_text(file_name: String, password: String) -> String {
    let mcrypt = new_magic_crypt!(&password, 256);
    let contents = std::fs::read_to_string(file_name).unwrap();
    let decrypted_string = mcrypt.decrypt_base64_to_string(&contents).unwrap();
    return decrypted_string;
}

//Creates a local file
#[tauri::command]
fn create_file(file_name: String) {
    let file_path = Path::new(&file_name).join("pword");
    let mut file = File::create(&file_path).unwrap();
    file.write_all(b"").unwrap();
}

//Writes a encrypted file
#[tauri::command]
fn write_file(file_path: String, password: String, text: String) {
    let mcrypt = new_magic_crypt!(&password, 256);
    let encrypted_string = mcrypt.encrypt_str_to_base64(text);

    let mut file = File::create(&file_path).unwrap();
    file.write_all(encrypted_string.as_bytes()).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file_text,
            create_file,
            write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
