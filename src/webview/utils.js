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

const normalize = (val, min, max) => ((val-min)/(max-min))*2-1;

export {halfstepToFrequency, seventhInterval, normalize};
