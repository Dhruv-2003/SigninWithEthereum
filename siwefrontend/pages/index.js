import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { useSignMessage, useSigner, useProvider, useAccount } from "wagmi";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });
const BACKEND_ADDR = "http://localhost:8080";

export default function Home() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const {
    data: SignData,
    isError,
    isLoading,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message: "gm wagmi frens",
  });
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [domain, setDomain] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setDomain(window.location.host);
    setOrigin(window.location.origin);
  }, []);

  async function createSiweMessage(address, statement) {
    const res = await fetch(`${BACKEND_ADDR}/nonce`);

    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: "80001",
      nonce: await res.text(),
    });
    return message.prepareMessage();
  }

  const signMessageWithETH = async () => {
    try {
      const message = await createSiweMessage(
        address,
        "Sign in with ETH into the App"
      );
      setMessage(message);
      console.log(message);
      const signature = await signer.signMessage(message);
      setSignature(signature);
      console.log(signature);

      const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
        credentials: "include",
      });
      console.log(await res.text());
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessageForVerification = async () => {
    try {
      const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
        credentials: "include",
      });
      console.log(await res.text());
    } catch (error) {
      console.log(error);
    }
  };

  async function getInformation() {
    const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
      credentials: "include",
    });
    console.log(await res.text());
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Sigin with Ethereum Demo</p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By @0xdhruv
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <ConnectButton />
          <br />
          <button onClick={() => signMessage()}> Sign Wagmi Message</button>
          <br />
          <button onClick={() => signMessageWithETH()}>
            {" "}
            Sign SIWE Message
          </button>
          <br />
          <button onClick={() => sendMessageForVerification()}>
            {" "}
            Send for Verification
          </button>
          <br />
          <button onClick={() => getInformation()}>
            {" "}
            Get Verification Info
          </button>
        </div>
      </main>
    </>
  );
}
