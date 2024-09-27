const https = require('https');
//const fs = require('fs');
const readline = require('readline')

// Define the URL
const url = 'https://insurecomp.com/sales-data.txt';


// Data structures to store the required information
let salesData = {};
let totalSales = 0;

https.get(url, (response) => {
    const rl = readline.createInterface({
        input: response,
        output: process.stdout,
        terminal: false,
    });

    // Reading each line of the sales data
    rl.on('line', (line) => {
        const [date, item,  pricePerUnit, quantitySold, totalPrice ] = line.split(',').map(value => value.trim());
        const quantity = parseInt(quantitySold);
        const price = parseFloat(pricePerUnit);
        const totalPricePerDay = parseInt(totalPrice);
        if(price){
        const revenue = totalPricePerDay;

        // Extract year and month from the date (assumed format: YYYY-MM-DD)
        const [year, month] = date.split('-');

        // Create a key for the month (YYYY-MM)
        const monthKey = `${year}-${month}`;

        // Initialize the month's data structure if it doesn't exist
        if (!salesData[monthKey]) {
            salesData[monthKey] = {
                totalSales: 0,
                items: {},
                mostPopularItem: null,
                mostRevenueItem: null,
            };
        }

        // Update total sales
        totalSales += revenue;

        // Update sales data for the month
        let monthData = salesData[monthKey];
        monthData.totalSales += revenue;

        // Track item data for the month
        if (!monthData.items[item]) {
            monthData.items[item] = {
                quantitySold: 0,
                totalRevenue: 0,
                orderCounts: [],
            };
        }

        monthData.items[item].quantitySold += quantity;
        monthData.items[item].totalRevenue += revenue;
        monthData.items[item].orderCounts.push(quantity);
    }
    });

    // Process the results when the file is fully read
    rl.on('close', () => {
        console.log(`Total sales of the store: $${totalSales.toFixed(2)}\n`);

        // Process month-wise data
        for (let monthKey in salesData) {
            const monthData = salesData[monthKey];
            console.log(`Sales report for ${monthKey}:`);
            console.log(`  Total sales: $${monthData.totalSales.toFixed(2)}`);

            let mostPopularItem = null;
            let mostRevenueItem = null;

            // Find the most popular and highest revenue-generating items
            for (let item in monthData.items) {
                let itemData = monthData.items[item];

                // Most popular item based on quantity sold
                if (!mostPopularItem || itemData.quantitySold > monthData.items[mostPopularItem].quantitySold) {
                    mostPopularItem = item;
                }

                // Most revenue-generating item based on total revenue
                if (!mostRevenueItem || itemData.totalRevenue > monthData.items[mostRevenueItem].totalRevenue) {
                    mostRevenueItem = item;
                }
            }

            console.log(`  Most popular item: ${mostPopularItem} (Quantity Sold: ${monthData.items[mostPopularItem].quantitySold})`);
            console.log(`  Item generating most revenue: ${mostRevenueItem} (Revenue: $${monthData.items[mostRevenueItem].totalRevenue.toFixed(2)})`);

            // Calculate min, max, and average number of orders for the most popular item
            let popularItemData = monthData.items[mostPopularItem];
            let minOrders = Math.min(...popularItemData.orderCounts);
            let maxOrders = Math.max(...popularItemData.orderCounts);
            let avgOrders = popularItemData.quantitySold/popularItemData.orderCounts.length;

            console.log(`  For ${mostPopularItem}: Min orders: ${minOrders}, Max orders: ${maxOrders}, Avg orders: ${avgOrders.toFixed(2)}\n`);
        }
    });
});
