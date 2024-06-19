use std::{env::var, fs::write, path::Path};

fn main() {
    // Write abi path.
    let out_dir = var("OUT_DIR").unwrap();
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let dest_path = Path::new(&out_dir).join("bindings.rs");

    let contract_abi_path = format!("{manifest_dir}/abi.json");

    // Tell Cargo that if ABI changes, to rerun this build script.
    println!("cargo:rerun-if-changed={manifest_dir}/abi.json");
    write(
        &dest_path,
        format!(r#"fuels::prelude::abigen!(Contract(name="Vrf", abi="{contract_abi_path}"));"#),
    )
    .unwrap();
}
