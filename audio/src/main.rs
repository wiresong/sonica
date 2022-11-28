use std::io::stdin;

use anyhow::Result;
use serde::Deserialize;
use sounds::Sounds;
use tones::Tones;
use synthizer as syz;

mod sounds;
mod tones;


#[derive(Debug, Deserialize)]
#[serde(tag = "command")]
enum Command<'a> {
    Play,
    Pause,
    Volume { volume: f64 },
    Tones { tones: usize },
    Sound { sound: &'a str, position: f64 },
}

// Error handling, eventually
fn main() -> Result<()> {
    let _init = syz::initialize();
    let context = syz::Context::new()?;
    

    let mut tones_gen = Tones::new(&context)?;
    let mut sounds = Sounds::new(&context)?;

    let mut buff = String::new();
    loop {
        stdin().read_line(&mut buff)?;
        let des: Command = serde_json::from_str(&buff).unwrap();
        match des {
            Command::Play => context.play()?,
            Command::Pause => context.pause()?,
            Command::Volume { volume } => context.gain().set(volume)?,
            Command::Tones { tones } => tones_gen.play(tones)?,
            Command::Sound { sound, position } => sounds.play(sound, position)?,
        };
        buff.clear();
    }
}
