import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">NovaDrive Automotive</p>
          <p className="footer-text">
            Precision care for every mile. Schedule maintenance, manage your
            vehicles, and reach help on the road in one connected experience.
          </p>
        </div>
        <div>
          <p className="footer-heading">Support</p>
          <ul>
            <li>
              <Link href="/appointments">Book an appointment</Link>
            </li>
            <li>
              <Link href="/roadside-assistance">Roadside request</Link>
            </li>
            <li>
              <a href="mailto:support@novadrive.com">support@novadrive.com</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-heading">Visit</p>
          <p className="footer-text">
            845 Innovation Way
            <br />
            Detroit, MI 48201
          </p>
        </div>
      </div>
      <div className="footer-base">
        <p>© {new Date().getFullYear()} NovaDrive Automotive. All rights reserved.</p>
      </div>
    </footer>
  );
}
