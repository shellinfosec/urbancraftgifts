import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import InquiryDialog from "@/components/inquiry/InquiryDialog";
import * as inquiryService from "@/lib/inquiry-service";

describe("InquiryDialog Review step & auto-submit guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("does NOT automatically submit upon reaching the review step and requires deliberate submit", async () => {
    const submitSpy = vi.spyOn(inquiryService, "submitInquiry").mockResolvedValue({
      ok: true,
      mode: "sent",
      id: "TEST-123456",
    });

    render(<InquiryDialog open={true} onOpenChange={() => {}} prefill={{}} prefillKey={1} />);

    // Step 0: Purpose - Select an intent
    const intentOption = screen.getByRole("radio", { name: /employee gifting/i });
    await act(async () => {
      fireEvent.click(intentOption);
    });

    // Advance: Step 0 -> Step 1 (Products)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Step 1: Products - Click continue to Step 2
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Step 2: Details - Select quantity
    const quantityOption = await screen.findByRole("radio", { name: "25–100" });
    await act(async () => {
      fireEvent.click(quantityOption);
    });

    // Advance: Step 2 -> Step 3 (Contact)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Step 3: Contact - Fill required fields
    const nameInput = await screen.findByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/work email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Rohit Sharma" } });
      fireEvent.change(emailInput, { target: { value: "rohit@example.com" } });
      fireEvent.change(phoneInput, { target: { value: "+91 9876543210" } });
    });

    // Advance: Step 3 -> Step 4 (Review)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Verify Review step (Step 4) is displayed
    expect(await screen.findByText(/Step 5 of 5: Review & Confirm/i)).toBeInTheDocument();
    expect(screen.getByText(/Security Verification/i)).toBeInTheDocument();

    // CRITICAL ASSERTION: Entering the Review step MUST NOT automatically submit!
    expect(submitSpy).not.toHaveBeenCalled();

    // The submit button is now present on the review screen
    const submitBtn = screen.getByRole("button", { name: /submit enquiry/i });
    expect(submitBtn).toBeInTheDocument();

    // Submit only occurs when user deliberately clicks "Submit enquiry"
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Rohit Sharma",
        email: "rohit@example.com",
        phone: "+91 9876543210",
      }),
    );
  }, 15000);

  it("pressing Enter in contact input fields advances steps rather than auto-submitting", async () => {
    const submitSpy = vi.spyOn(inquiryService, "submitInquiry").mockResolvedValue({
      ok: true,
      mode: "sent",
      id: "TEST-123456",
    });

    render(<InquiryDialog open={true} onOpenChange={() => {}} prefill={{}} prefillKey={1} />);

    // Select intent
    fireEvent.click(screen.getByRole("radio", { name: /employee gifting/i }));

    // Advance to step 1
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Advance to step 2
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // Select quantity on step 2
    fireEvent.click(await screen.findByRole("radio", { name: "25–100" }));

    // Advance to step 3
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });

    // On Step 3: fill inputs and press Enter on phone field
    const nameInput = await screen.findByLabelText(/your name/i);
    const emailInput = screen.getByLabelText(/work email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    fireEvent.change(nameInput, { target: { value: "Anita Desai" } });
    fireEvent.change(emailInput, { target: { value: "anita@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+91 9123456789" } });

    // Press Enter in phone input
    await act(async () => {
      fireEvent.keyDown(phoneInput, { key: "Enter", code: "Enter" });
      await Promise.resolve();
    });

    // Advance occurred to Review step, but NO submission occurred
    expect(await screen.findByText(/Step 5 of 5: Review & Confirm/i)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();
  }, 15000);
});
