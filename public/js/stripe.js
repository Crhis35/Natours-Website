import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_5JWT2RnksRGKoBa0AKU5FRqw004sjgr2yn');

export const bookTour = async (tourId) => {
  try {
    // 1) gET CHECKOUT SESSION FOMR API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // 2) Create checkout fomr + chance credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
