import Link from "next/link";
import "./book-trip-button.css";

export default function BookTripButton() {
  return <Link className="book-trip-button" href="/#contact">BOOK YOUR TRIP <span aria-hidden="true">↗</span></Link>;
}
