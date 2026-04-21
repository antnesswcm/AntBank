use std::fs;
use serde::{Deserialize, Serialize};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "banks/"]
struct Asset;

#[derive(Debug, Serialize, Deserialize)]
pub struct Option {
    pub id: u32,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Answer {
    pub option_ids: Vec<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Question {
    pub id: u32,
    pub content: String,
    #[serde(rename = "type")]
    pub question_type: u32,
    pub type_name: String,
    pub options: Vec<Option>,
    pub answer: Answer,
    pub analysis: std::option::Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Chapter {
    pub id: u32,
    pub title: String,
    pub total: u32,
    pub questions: Vec<Question>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QuestionBank {
    pub meta: Meta,
    pub chapters: Vec<Chapter>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Meta {
    pub title: String,
    pub slug: String,
    pub description: String,
    pub total: u32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuiltInBank {
    pub filename: String,
    pub title: String,
    pub slug: String,
    pub total: u32,
}

#[tauri::command]
fn load_question_bank(path: String) -> Result<QuestionBank, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("读取题库文件失败: {}", e))?;
    let bank: QuestionBank = serde_json::from_str(&content)
        .map_err(|e| format!("解析题库JSON失败: {}", e))?;
    Ok(bank)
}

#[tauri::command]
fn load_question_banks(paths: Vec<String>) -> Result<Vec<QuestionBank>, String> {
    let mut banks = Vec::new();
    for path in paths {
        match load_question_bank(path.clone()) {
            Ok(bank) => banks.push(bank),
            Err(e) => return Err(e),
        }
    }
    Ok(banks)
}

#[tauri::command]
fn get_builtin_banks() -> Result<Vec<BuiltInBank>, String> {
    let mut banks = Vec::new();
    
    for file_name in Asset::iter() {
        if file_name.ends_with(".json") {
            if let Some(content) = Asset::get(&file_name) {
                let content_str = std::str::from_utf8(content.data.as_ref())
                    .map_err(|e| format!("读取题库文件失败: {}", e))?;
                if let Ok(bank) = serde_json::from_str::<QuestionBank>(content_str) {
                    banks.push(BuiltInBank {
                        filename: file_name.to_string(),
                        title: bank.meta.title,
                        slug: bank.meta.slug,
                        total: bank.meta.total,
                    });
                }
            }
        }
    }
    
    Ok(banks)
}

#[tauri::command]
fn load_builtin_bank(filename: String) -> Result<QuestionBank, String> {
    let content = Asset::get(&filename)
        .ok_or_else(|| format!("找不到题库文件: {}", filename))?;
    
    let content_str = std::str::from_utf8(content.data.as_ref())
        .map_err(|e| format!("读取题库内容失败: {}", e))?;
    
    let bank: QuestionBank = serde_json::from_str(content_str)
        .map_err(|e| format!("解析题库JSON失败: {}", e))?;
    Ok(bank)
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(prevent_default())
        .invoke_handler(tauri::generate_handler![
            load_question_bank,
            load_question_banks,
            get_builtin_banks,
            load_builtin_bank,
            get_app_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(debug_assertions)]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    use tauri_plugin_prevent_default::Flags;
    tauri_plugin_prevent_default::Builder::new()
        .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
        .build()
}

#[cfg(not(debug_assertions))]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    tauri_plugin_prevent_default::init()
}
