import Link from "next/link";
import "./book-trip-button.css";

export default function BookTripButton() {
  return <Link className="book-trip-button" href="/#contact">GET MORE INFO <span aria-hidden="true">↗</span></Link>;
}
