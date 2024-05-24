import { CosmosClient } from "@azure/cosmos";

require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseName = "products-db";
const containerProductsID = "products";
const containerStocksID = "stocks";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseName);
const productContainer = database.container(containerProductsID);
const stockContainer = database.container(containerStocksID);

export { productContainer, stockContainer };
