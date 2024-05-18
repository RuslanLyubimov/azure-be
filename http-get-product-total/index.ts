import { AzureFunction, Context } from "@azure/functions";
import { productContainer, stockContainer } from "../model/cosmosConfig";

const getStock = async (id) => {
  try {
    const stock = await stockContainer.items
      .query(`SELECT * FROM s WHERE s.product_id = "${id}"`)
      .fetchAll();
    return stock.resources[0];
  } catch (error) {
    throw new Error(`Error fetching stock for product ${id}: ${error.message}`);
  }
};

const getProducts = async () => {
  try {
    const products = await productContainer.items
      .query("SELECT * FROM products")
      .fetchAll();

    return Promise.all(
      products.resources.map(async (product) => {
        const stock = await getStock(product.id);
        return {
          ...product,
          count: stock ? stock.count || 1 : 0,
        };
      })
    );
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

const getProductTotal = async (context: Context) => {
  try {
    context.log("Fetching products and their counts...");
    const products = await getProducts();
    context.log("Products retrieved successfully.");

    return products.reduce((acc, item) => acc + item.count, 0);
  } catch (error) {
    context.log.error(`Error calculating product total: ${error.message}`);
    throw new Error("Failed to calculate product total.");
  }
};

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<void> {
  try {
    context.log("HTTP GET request to fetch total products processed.");
    const total = await getProductTotal(context);

    context.res = {
      status: 200,
      body: total,
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: `Error: ${error.message}`,
    };
  }
};

export default httpTrigger;
