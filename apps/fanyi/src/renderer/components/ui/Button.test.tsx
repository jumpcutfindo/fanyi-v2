import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button component', () => {
  it('should render the button with the children as its content', () => {
    render(<Button>Click Me</Button>);

    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });
});
