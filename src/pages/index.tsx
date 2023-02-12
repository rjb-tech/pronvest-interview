import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useFormik } from "formik";
import { useState } from "react";

import stockData from "../stocks.json";
import { CodeBlock } from "@/components/CodeBlock";
import { SubSection } from "@/components/SubSection";

const inter = Inter({ subsets: ["latin"] });

interface Portfolio {
  value: number;
  error?: string;
}

function getPortfolioValue(portfolioString: string): Portfolio {
  try {
    const queriedStocks = portfolioString.replaceAll('"', "").split(",");

    const totalPortfolioWorth = queriedStocks.reduce((prev, current) => {
      const [queriedTicker, queriedAmount] = current.split(":");
      const queriedStock = stockData.filter(
        (entry) => entry.ticker === queriedTicker
      );

      if (!queriedStock[0])
        throw new Error(
          `${queriedTicker} is not a valid stock, please try again.`
        );
      else {
        const queriedStockWorth = Number(queriedAmount) * queriedStock[0].close;

        return prev + queriedStockWorth;
      }
    }, 0);

    return { value: totalPortfolioWorth };
  } catch (err: any) {
    return { value: 0, error: err };
  }
}

interface ProfitOutput {
  profit: number;
  dayToBuy?: number;
  dayToSell?: number;
  error?: string;
}

function maximizeProfit(stockPriceByDay: string): ProfitOutput {
  const parsedData = stockPriceByDay
    .replaceAll('"', "")
    .split(",")
    .map((price) => Number(price));

  const maxPriceIndex = parsedData.indexOf(Math.max(...parsedData));
  const minPriceIndex = parsedData.indexOf(Math.min(...parsedData));

  let dayToSell = 0;
  const maxProfit = parsedData.reduce((runningProfit, current, index) => {
    if (index > minPriceIndex) {
      const potentialProfit = current - parsedData[minPriceIndex];

      if (potentialProfit > runningProfit) {
        dayToSell = index + 1;
        return potentialProfit;
      } else return runningProfit;
    }

    return 0;
  }, 0);

  if (maxProfit === 0) return { profit: 0 };
  else return { profit: maxProfit, dayToBuy: minPriceIndex + 1, dayToSell };
}

const numberFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function handlePart1(queriedStocks: string): string {
  const portfolio = getPortfolioValue(queriedStocks);
  if (!portfolio.error)
    return `The queried portfolio is worth ${numberFormat.format(
      portfolio.value
    )}.`;

  return `${portfolio.error}`;
}

// This is used for both -part2 and -bonus. I couldn't tell them apart so I wanted to handle both cases
function handlePart2(pricesByDay: string): string {
  const profitInfo = maximizeProfit(pricesByDay);
  if (profitInfo.profit > 0)
    return `Buy on day ${profitInfo.dayToBuy} and sell on day ${
      profitInfo.dayToSell
    } for a profit of ${numberFormat.format(profitInfo.profit)}.`;

  return "No profitable buy/sell options listed.";
}

export default function Home() {
  const [output, setOutput] = useState<string>(
    "Welcome! This was made for an interview with ProNVest."
  );

  const formik = useFormik({
    initialValues: { command: "" },
    onSubmit: (values) => {
      const [part, data] = values.command.split(" ");

      switch (part) {
        case "-part1":
          setOutput(handlePart1(data));
          break;
        case "-part2":
          setOutput(handlePart2(data));
          break;
        case "-bonus":
          setOutput(handlePart2(data));
          break;
        default:
          setOutput("Invalid input. See the options and test cases below.");
          break;
      }
    },
  });

  return (
    <>
      <Head>
        <title>Ryne Burden Sample App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen max-h-screen w-screen flex flex-col items-center justify-center">
        <div className="h-fit w-screen lg:w-1/2 bg-gray-700 rounded-md p-6 space-y-4">
          <div className="h-16 w-full rounded bg-black text-green-400 flex items-center justify-center p-2 transition-all">
            {output}
          </div>

          <div className="h-fit w-full flex items-center">
            <form
              className="w-full flex space-x-3"
              onSubmit={formik.handleSubmit}
            >
              <input
                onChange={formik.handleChange}
                onReset={formik.handleReset}
                className="w-full p-2 rounded focus-none bg-black"
                type="text"
                name="command"
                placeholder="test case"
                value={formik.values.command}
              />
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded transition-all"
                type="submit"
              >
                Submit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded transition-all"
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setOutput(
                    "Welcome! This was made for an interview with ProNVest."
                  );
                }}
              >
                Reset
              </button>
            </form>
          </div>

          <div className="h-full max-h-96 overflow-y-scroll overscroll-contain w-full bg-gray-600 p-4 space-y-6">
            <section className="space-y-2">
              <h2 className="text-2xl underline">Part 1</h2>
              <div className="pl-2">
                <p className="text-md">
                  A sample stock portfolio is passed in as an argument to a
                  console application. Your application should parse this input,
                  lookup the current stock price at close from the sample
                  stocks.json feed file, and then return the total value of the
                  portfolio.
                </p>
                <SubSection
                  subHeading="Input:"
                  innerText="-part1 [<TICKER>:<QUANTITY>]"
                />
                <SubSection subHeading="Output:" innerText="<TOTAL>" />
                <SubSection
                  subHeading="Test Case:"
                  innerText='-part1 "FB:12,PLTR:5000"'
                />
              </div>
            </section>
            <section className="space-y-2">
              <h2 className="text-2xl underline">Part 2</h2>
              <div className="pl-2">
                <p className="text-md">
                  An analyst has developed an equation for predicting future
                  stock prices. A client wants to use this algorithm to place a
                  buy order at the optimum time and one sell order at the
                  optimum time. You are provided a list of prices where
                  prices[i] is the price of a given stock on the ith day. You
                  want to maximize your profit by choosing a single day to buy
                  one stock and choosing one different day to sell in the
                  future. Due to trade restrictions, you may only place one buy
                  order and one sell order. Return the maximum profit that the
                  client can achieve from this transaction. If the client cannot
                  achieve any profit, then return 0. Your application should
                  work for any random list of prices.
                </p>
                <SubSection
                  subHeading="Input:"
                  innerText="-part2 [<PRICE>] OR -bonus [<PRICE>]"
                />
                <SubSection subHeading="Output:" innerText="<PROFIT>" />
                <SubSection
                  subHeading="Test Case:"
                  innerText='-part2 "7,1,5,3,6,4" OR -bonus "7,1,5,3,6,4"'
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
