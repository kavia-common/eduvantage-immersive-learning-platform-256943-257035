import { coursesData } from '../Courses';

describe('Courses data export', () => {
  it('exports a non-empty coursesData array', () => {
    expect(Array.isArray(coursesData)).toBe(true);
    expect(coursesData.length).toBeGreaterThan(0);
    expect(coursesData[0]).toHaveProperty('id');
    expect(coursesData[0]).toHaveProperty('title');
  });
});
