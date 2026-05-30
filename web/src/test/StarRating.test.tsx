import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StarRating } from '@/components/common/StarRating';

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    const { container } = render(<StarRating rating={4.5} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('shows rating count when provided', () => {
    render(<StarRating rating={4.0} count={1234} />);
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container: sm } = render(<StarRating rating={3} size="sm" />);
    const { container: lg } = render(<StarRating rating={3} size="lg" />);
    expect(sm.querySelector('svg')?.getAttribute('class')).toContain('w-3');
    expect(lg.querySelector('svg')?.getAttribute('class')).toContain('w-5');
  });
});
