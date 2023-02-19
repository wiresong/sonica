export class Range {
  start: number;
  end: number;
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
  contains(n: number) {
    return n >= this.start && n < this.end;
  }

  normalized(n: number) {
    if (this.end === Infinity) {
        return 1;
    }
	
    return ((n - this.start) / (this.end - this.start)) * 2 - 1;
  }
}