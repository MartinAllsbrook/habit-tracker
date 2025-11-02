import Link from "next/link";
import Image from "next/image";
import styles from "./NavBar.module.css";
import ProfileButton from "../components/ProfileButton.tsx";

export default function NavBar() {
    return (
        <nav className={styles.nav}>
            <Link href="/">
                <Image
                    src="/logo.svg"
                    alt="Home"
                    width={50}
                    height={50}
                />
            </Link>
            <ul className={styles.links}>
                <li>
                    <Link href="/about">About</Link>
                </li>
                <li>
                    <Link href="/blog">Blog</Link>
                </li>
                <li>
                    <Link href="/users">Users</Link>
                </li>
                <li>
                    <ProfileButton/>
                </li>
                
            </ul>
        </nav>
    );
}