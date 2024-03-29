use std::{collections::HashMap, fs::read_dir};

use synthizer::{Buffer, BufferGenerator, Context, DeleteBehaviorConfig, ScalarPannedSource};

use anyhow::Result;

pub struct Sounds<'a> {
    context: &'a Context,
    sounds: HashMap<String, Buffer>,
}

impl<'a> Sounds<'a> {
    pub fn new(context: &'a Context) -> Result<Self> {
        let mut sounds = HashMap::new();

        for entry in read_dir(".")? {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }

            if entry.path().to_string_lossy().ends_with("wav") {
                sounds.insert(
                    entry.file_name().into_string().unwrap(),
                    Buffer::from_file(entry.path())?,
                );
            }
        }

        Ok(Self { context, sounds })
    }

    pub fn play(&mut self, sound: &str, position: f64) -> Result<()> {
        let buffer = self
            .sounds
            .get(sound)
            .ok_or_else(|| anyhow::anyhow!("Could not find sound for {}", sound))?;

        let mut del = DeleteBehaviorConfig::new();
        del.set_linger(true);
        let src =
            ScalarPannedSource::new(self.context, synthizer::PannerStrategy::Stereo, position)?;
        src.config_delete_behavior(&del)?;
        let gen = BufferGenerator::new(self.context)?;
        gen.config_delete_behavior(&del)?;
        gen.buffer().set(buffer)?;
        src.add_generator(&gen)?;
        src.play()?;

        Ok(())
    }
}
