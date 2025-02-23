import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmationModal from "../../../components/common/ConfirmationModal.jsx"; // Adjust the import path as necessary

describe("ConfirmationModal Component", () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();
  const message = "Are you sure you want to proceed?";

  test("renders correctly when shown", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        message={message}
      />
    );

    expect(screen.getByText(/confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();
  });

  test("does not render when show is false", () => {
    render(
      <ConfirmationModal
        show={false}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        message={message}
      />
    );

    expect(screen.queryByText(/confirmation/i)).not.toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        message={message}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when confirm button is clicked", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        message={message}
      />
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
