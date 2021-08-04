// Reference note is A4
const halfstepToFrequency = n=>440*(2**(1/12))**n;

const seventhInterval=n=> {
  let halfstep = 0;
  for (let i=0; i<n; i++) {
    if (i%2===0) {
      halfstep += 4;
    } else {
      halfstep += 3;
    }
  }
  return halfstep;
};

// Note that this normalizes in the range [-1, 1], not [0, 1]
const normalize = (val, min, max) => ((val-min)/(max-min))*2-1;

class range {
  constructor(bounds) {
    this.bounds = bounds;
    this.bounds.sort((a, b)=>a-b);
    if (!this.bounds.includes(0)) {
      this.bounds.unshift(0);
    }
  }

  getBoundsFor(n) {
    for (const [index, element] of this.bounds.entries()) {
      if (n <= element ) {
        return [this.bounds[index-1], this.bounds[index]];
      }
    }
    return [];
  }
}


export {halfstepToFrequency, seventhInterval, normalize, range};
