use synthizer::{Context, DirectSource, FastSineBankGenerator};

use anyhow::Result;

pub struct Tones<'a> {
    context: &'a Context,
    src: DirectSource,
    tones: Vec<FastSineBankGenerator>,
}

impl<'a> Tones<'a> {
    pub fn new(context: &'a Context) -> Result<Self> {
        let src = DirectSource::new(context)?;
        Ok(Self {
            context,
            src,
            tones: Vec::new(),
        })
    }

    pub fn play(&mut self, tones: usize) -> Result<()> {
        let tones_len = self.tones.len();
        if tones_len < tones {
            for _ in tones_len..tones {
                self.add_tone()?;
            }
        }

        self.normalize_volume()?;
        self.play_tones(tones)?;
        Ok(())
    }

    fn add_tone(&mut self) -> Result<()> {
        // Random closures? shrug
        let halfstep_to_frequency =
            |halfstep: u8| 220.0 * ((2.0f64).powf(1.0 / 12.0)).powi(halfstep as i32);
        // Look at the sins I have committed
        let seventh_interval = |interval: u8| (0..interval).map(|f| 4 - (f % 2)).sum();
        let tone = FastSineBankGenerator::new_sine(
            self.context,
            halfstep_to_frequency(seventh_interval(self.tones.len() as u8)),
        )?;

        self.src.add_generator(&tone)?;
        self.tones.push(tone);
        Ok(())
    }

    fn normalize_volume(&mut self) -> Result<()> {
        let length = self.tones.len() as f64;
        for tone in self.tones.iter_mut() {
            tone.gain().set(1.0 / length)?;
        }
        Ok(())
    }

    fn play_tones(&mut self, tones: usize) -> Result<()> {
        for i in 0..tones {
            self.tones[i].play()?;
        }
        for i in tones..self.tones.len() {
            self.tones[i].pause()?;
        }
        Ok(())
    }
}
