import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { pageRender } from '../../../../__tests__/fixtures/page-render';
import { setMockedUser } from '../../../../__tests__/fixtures/page-render';
import { mockNextRouter } from '../../../../__tests__/mocks/next-router';
import { Welcome } from '../../welcome';

setMockedUser({
  email: '',
  name: '',
});

jest.mock('canvas-confetti');

jest.setTimeout(10_000);

describe('Welcome', () => {
  beforeEach(() => {
    pageRender(<Welcome />);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return cleanup();
  });

  it.skip('should render the form and text', () => {
    expect(screen.getByText(/Welcome/)).toBeTruthy();
  });

  it.skip('should call api with filled fields', async () => {
    const email = 'email@test.com';
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await userEvent.type(emailInput, email);
    const displayName = 'Test name';
    const displayNameInput = screen.getByLabelText(/dispaly name/i);
    await userEvent.type(displayNameInput, displayName);
    const userNameInput = screen.getByRole('textbox', {
      name: /username/i,
    });
    const userName = 'testuser';
    await userEvent.type(userNameInput, userName);
    const saveButton = screen.getByRole('button', {
      name: /save/i,
    });
    await userEvent.click(saveButton);

    await waitFor(() => expect(mockNextRouter.push).toHaveBeenCalledWith('/'), {
      timeout: 4000,
    });
  });
});
