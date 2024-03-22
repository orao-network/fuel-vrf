use std::path::Path;

use fuels::crypto::SecretKey;

pub fn derive_account_with_index(
    password: &str,
    path: &Path,
    account_index: usize,
) -> anyhow::Result<SecretKey> {
    let phrase_recovered = eth_keystore::decrypt_key(path, password)?;
    let phrase = String::from_utf8(phrase_recovered)?;
    let derive_path = format!("m/44'/1179993420'/{}'/0/0", account_index);
    let secret_key = SecretKey::new_from_mnemonic_phrase_with_path(&phrase, &derive_path)?;
    Ok(secret_key)
}
