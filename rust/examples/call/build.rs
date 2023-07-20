use std::io::{self, Write};
use std::process::Command;

fn main() {
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let manifest_dir = env!("CARGO_MANIFEST_DIR");

    // Tell Cargo that if the given files changes, to rerun this build script.
    println!("cargo:rerun-if-changed={manifest_dir}/src/main.sw");
    println!("cargo:rerun-if-changed={manifest_dir}/src/error.sw");

    // Write abi path.
    let dest_path = std::path::Path::new(&out_dir).join("bindings.rs");
    let contract_abi_path = if cfg!(not(debug_assertions)) {
        format!("{manifest_dir}/out/release/russian-roulette-abi.json")
    } else {
        format!("{manifest_dir}/out/debug/russian-roulette-abi.json")
    };
    std::fs::write(
        &dest_path,
        format!(r#"fuels::prelude::abigen!(Contract(name = "RussianRoulette", abi="{contract_abi_path}"));"#),
    )
    .unwrap();

    let mut command = Command::new("forc");
    command.arg("build");
    command.current_dir(&format!("{manifest_dir}"));

    if cfg!(not(debug_assertions)) {
        command.arg("--release");
    }

    let output = command
        .output()
        .expect("failed to build the contract using forc");

    if !output.status.success() {
        io::stdout().write_all(&output.stdout).unwrap();
        io::stderr().write_all(&output.stderr).unwrap();
        panic!("Unable to build the contract")
    }
}
