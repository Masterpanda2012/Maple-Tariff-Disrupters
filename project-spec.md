# Maple Tariff Disruptors
Tagline Ideas: We make the boring tasks melt away with maple-grade magic | Leave the hard work to us | We make the boring tasks melt away, Very Canadian, Very chill | Melting away the boring…

## Tech Stack:

Typescript \+ Next.js 

This project is a Canadian platform for businesses to navigate economic swings due to tariffs, and it helps people who want to support Canadian businesses find and buy Canadian products.

## Project Details

2 types of accounts:

Business Account  
\- Businesses can list their products to buy canadian  
\- Companies set up their account industry, suppliers, etc..  
\- Businesses can monitor economic changes for a business depending on their structure  
\- List products  
\- Get helpful economic trends  
\- Manage inventory and get tips on the best time to restock based global news / data  
i.e. A car manufacturer sets up their account and advertises their products/services. When news comes out that affects their business, they get a message of the news and how they can respond to it.

Regular account   
\- Functions as a marketplace (Similar to Amazon), but with only Canadian products   
\- support canadian  
\- Users can order online, manage recurring orders, …  
\- can see newest affecting the products and companies they interact with.  
\- Can see canadian sports and buy tickets   
\- with trip planning for those tickets (Do not implement for MVP).

## User Workflow:

Business:  
\-Sign up for account using business email  
\- Platform will verify that the business originates from using the below methods (This will be mocked for the MVP implementation. Do not implement this):

1\. Official Government Registries & APIs (Most Reliable)  
The most accurate method is to use official data sources to confirm a business’s legal incorporation or registration in Canada.

* Canada's Business Registries (CBR): This is a centralized search tool that allows an app to search for corporations and limited partnerships across federal, provincial, and territorial registries.  
* Corporations Canada Federal Corporation API: An app can use this API to get real-time information on federally registered companies, including status, address, and directors, using a 9-digit business number or corporate name.  
* Nuans Search: This tool can be used to search for corporate names and trademarks to confirm Canadian registration.  
* GST/HST Registration Check: A business having a GST/HST number (a 9-digit business number) from the Canada Revenue Agency (CRA) is a strong indicator of Canadian operation. 

2\. Barcode & Product Data Analysis  
Apps designed for shopping, like Shop Canadian and Buy Beaver, analyze barcodes to determine the origin of the product. 

* Standardization Organizations: The app can access databases that map barcodes to companies, then verify if that company is registered in Canada.  
* "Made in Canada" vs. "Product of Canada": These apps often categorize companies based on specific criteria:  
  * Product of Canada: 98% or more of the cost of production is Canadian.  
  * Made in Canada: 51% or more of the cost of production is Canadian. 

3\. Crowdsourcing and User-Driven Information  
For smaller businesses or sole proprietorships that might not show up in the federal corporate registry, apps rely on community verification.

* Community Voting: Users scan barcodes and vote on whether the product is Canadian, which increases the accuracy of the database over time.  
* Brand Ownership Verification: The app can track whether a Canadian brand has been acquired by a foreign entity, such as in the case of Kicking Horse Coffee

## User Workflow

\- A new business user will be prompted for details about their business (Supplier, industry, company name, mission/purpose, what it does, etc.) through a series of questions

\- From there, the user can list items/products for user to buy, along with descriptions/prices (similar to Amazon, with a rating system based on user reviews). 

\- Upon a business user’s request, an algorithm will query the database for the latest relevant information (based on tags of a row) and feed it to an LLM, which will identify relevant information for the given business user. From there, another LLM will be run to summarize all of the info so that it is clear, and easy to understand, as well as create some steps to circumvent/minimize the economic loss both in the short, and long term.

	\- The business can see what news articles this information came from and click on the links to these articles as well as see a preview of the articles just from their dashboard. 

\- After enough time, businesses will be given the analytical data of their customers, along with what they can improve, and other trends

Customer:

\- The customer will be prompted to sign in/make an account

\- After that, customers can explore, and select from a large catalogue of products listed by businesses (Similar to Amazon, with a search bar, recommended products, deals, etc.)

\- Along with this, the customers can leave reviews (5-star system, along with a write up for more details). Businesses will be updated about these reviews, along with other analytical data.

\- The app will also have a way to pay for items using already existing digital payment methods:

*  [Mobile Wallets/Digital Wallets](https://www.google.com/search?q=Mobile+Wallets%2FDigital+Wallets&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAE): Apps like Apple Pay, Google Pay, and Samsung Pay store encrypted card data on smartphones for contactless in-store or online payments.  
* [Online Payment Systems/Apps](https://www.google.com/search?q=Online+Payment+Systems%2FApps&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAM): Services like PayPal, Venmo, and Cash App enable fast, often peer-to-peer (P2P), transfers and online purchases.  
* [Bank Transfers (EFT & e-Transfers)](https://www.google.com/search?q=Bank+Transfers+%28EFT+%26+e-Transfers%29&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAU): Electronic Funds Transfers (EFT) include direct deposits and bank-initiated online payments. In Canada, Interac e-Transfer is widely used for sending money directly from bank accounts.  
* [QR Codes](https://www.google.com/search?q=QR+Codes&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAc): Digital barcodes that, when scanned by a smartphone, initiate fast payments, popular in retail for instant, touch-free transactions.  
* [Contactless Cards/Tapping](https://www.google.com/search?q=Contactless+Cards%2FTapping&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAk): Tapping physical credit/debit cards equipped with NFC technology, allowing for fast, secure payments.  
* [Buy Now Pay Later (BNPL)](https://www.google.com/search?q=Buy+Now+Pay+Later+%28BNPL%29&rlz=1C5CHFA_enCA1176CA1176&oq=digital+payment+methods+&gs_lcrp=EgZjaHJvbWUyCggAEEUYFhgeGDkyBwgBEAAYgAQyBwgCEAAYgAQyCAgDEAAYFhgeMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEINTM5N2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwiB7oCOjLSTAxVBOTQIHZAgLCwQgK4QegYIAQgBEAs): Services like Affirm or PayBright that allow for deferred, installment-based digital payments

## Implementation

Business relevant news dashboard

- Cron job to request news from Diffy workflow that does the following:  
- Request news from Diffy  
- Store in DB

For each business dashboard:

- Query DB for relevantly tagged news  
- Feed to LLM to make a report of what news is relevant right now {Title: string, report: string}  
- Display this output on the dashboard

For the regular user marketplace:

- Query products and show them.

### AI Agent Instructions

- Follow the SOLID and DRY paradigms  
- When writing code use the following workflow:  
  - Write the function signature with a stub return statement  
  - Write a docstring for the function specification, document edge cases, document happy path and bad path cases, document error cases.  
  - Write tests for the function based on the function spec  
  - Implement the function  
  - Run tests and make sure they pass. If not, iterate.
