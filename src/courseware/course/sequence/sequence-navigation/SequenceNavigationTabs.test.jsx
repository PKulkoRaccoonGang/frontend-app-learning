import React from 'react';
import { Factory } from 'rosie';
import { act, fireEvent, getAllByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  initializeTestStore, render, screen, waitFor,
} from '../../../../setupTest';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';
import SequenceNavigationTabs from './SequenceNavigationTabs';

// Mock the hook to avoid relying on its implementation and mocking `getBoundingClientRect`.
jest.mock('../../../../generic/tabs/useIndexOfLastVisibleChild');

describe('Sequence Navigation Tabs', () => {
  let mockData;

  const courseMetadata = Factory.build('courseMetadata');
  const unitBlocks = [Factory.build(
    'block',
    { type: 'problem' },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'video', complete: true },
    { courseId: courseMetadata.id },
  ), Factory.build(
    'block',
    { type: 'other', complete: true, bookmarked: true },
    { courseId: courseMetadata.id },
  )];
  const activeBlockNumber = 2;

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, unitBlocks });
    mockData = {
      // Blocks are numbered from 1 in the UI, so we're decreasing this by 1 to have correct block's ID in the array.
      unitId: unitBlocks[activeBlockNumber - 1].id,
      onNavigate: () => {},
      showCompletion: false,
      unitIds: unitBlocks.map(unit => unit.id),
    };
  });

  it('renders unit buttons', () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    render(<SequenceNavigationTabs {...mockData} />);

    expect(screen.getAllByRole('tab')).toHaveLength(unitBlocks.length);
  });

  it('renders unit buttons and dropdown button', async () => {
    let container = null;
    await act(async () => {
      useIndexOfLastVisibleChild.mockReturnValue([-1, null, null]);
      const booyah = render(<SequenceNavigationTabs {...mockData} />);
      container = booyah.container;

      const dropdownToggle = container.querySelector('.dropdown-toggle');
      // We need to await this click here, which requires us to await the `act` as well above.
      // https://github.com/testing-library/react-testing-library/issues/535
      // Without doing this, we get a warning about using `act` even though we are.
      await fireEvent.click(dropdownToggle);
    });
    const dropdownMenu = container.querySelector('.dropdown');
    const dropdownButtons = getAllByRole(dropdownMenu, 'tab');

    expect(dropdownButtons).toHaveLength(unitBlocks.length);
    expect(getAllByRole(dropdownMenu, 'button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: `${activeBlockNumber} of ${unitBlocks.length}` }))
      .toHaveClass('dropdown-toggle');
  });

  it('focuses buttons after pressing ArrowRight or ArrowLeft keys', async () => {
    useIndexOfLastVisibleChild.mockReturnValue([0, null, null]);
    render(<SequenceNavigationTabs {...mockData} />);

    const firstUnitButton = screen.getAllByRole('tab')[0];
    firstUnitButton.focus();

    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getAllByRole('tab')[1]);
    });

    await userEvent.keyboard('{ArrowLeft}');

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getAllByRole('tab')[0]);
    });
  });
});
