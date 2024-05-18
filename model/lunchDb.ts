const { CosmosClient } = require("@azure/cosmos");
const { faker } = require("@faker-js/faker");

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

async function lunch() {
  for (let i = 0; i < 6; i++) {
    const productId = faker.string.uuid();
    const product = {
      id: productId,
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
    };
    await productContainer.items.upsert(product);

    const stock = {
      product_id: productId,
      count: faker.number.int({ min: 1, max: 50 }),
    };
    await stockContainer.items.upsert(stock);
  }

  console.log("Data is added");
}

lunch().catch((err) => {
  console.error(err);
});
