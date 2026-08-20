
      
# Hardcoded dictionary of stock prices
stock_prices = {
    "AAPL": 188,
    "TSLA": 250,
    "GOOG": 2734,
    "MSFT": 340,
    "AMZN": 130
}

# Function to get user portfolio
def get_portfolio():
    portfolio = {}
    n = int(input("How many different stocks do you own? "))
    for _ in range(n):
        symbol = input("Enter stock symbol (e.g., AAPL): ").upper()
        if symbol not in stock_prices:
            print(f"Sorry, price for {symbol} not found. Skipping.")
            continue
        qty = int(input(f"Enter quantity of {symbol}: "))
        portfolio[symbol] = qty
    return portfolio

# Calculate total investment
def calculate_investment(portfolio):
    total = 0
    details = []
    for symbol, qty in portfolio.items():
        price = stock_prices[symbol]
        investment = price * qty
        details.append(f"{symbol}\t{qty}\t{price}\t{investment}")
        total += investment
    return total, details

# Optional: save results to file
def save_to_file(details, total, filename):
    with open(filename, "w") as f:
        f.write("Stock\tQty\tPrice\tValue\n")
        for line in details:
            f.write(line + "\n")
        f.write(f"\nTotal Investment: {total}\n")
    print(f"Results saved to {filename}")

# Main program
if __name__ == "__main__":
    portfolio = get_portfolio()
    total, details = calculate_investment(portfolio)
    print("\nStock\tQty\tPrice\tValue")
    for line in details:
        print(line)
    print(f"\nTotal Investment: {total}")

    # Optional: Save to file
    save = input("Save results to a file? (y/n): ").strip().lower()
    if save == "y":
        filename = input("Enter file name to save (e.g., portfolio.txt): ")
        save_to_file(details, total, filename)