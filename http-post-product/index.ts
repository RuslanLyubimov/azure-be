import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { productContainer, stockContainer } from "../model/cosmosConfig";
import { IProduct } from "../types";

const getStock = async (id: string, context: Context) => {
  context.log(`Fetching stock for product ID: ${id}`);
  const { resources } = await stockContainer.items
    .query(`SELECT * FROM s WHERE s.product_id = "${id}"`)
    .fetchAll();

  return resources[0];
};

const createStock = async (id: string, count: number, context: Context) => {
  const stock = await getStock(id, context);
  const newStock = {
    product_id: id,
    count,
    id: stock ? stock.id : undefined,
  };

  context.log(
    `Creating/updating stock for product ID: ${id} with count: ${count}`
  );
  return stockContainer.items.upsert(newStock);
};

const createProduct = async (product: IProduct, context: Context) => {
  const updatedProduct = {
    title: product.title,
    description: product.description,
    price: product.price,
    id: product.id,
  };

  context.log(`Creating/updating product with ID: ${product.id}`);
  const { resource: newProduct } = await productContainer.items.upsert(
    updatedProduct
  );
  const { resource: newStock } = await createStock(
    newProduct.id,
    product.count,
    context
  );

  return {
    ...newProduct,
    count: newStock.count,
  };
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP post product processed a request.");
  context.log(`Request body: ${JSON.stringify(req.body)}`);

  if (
    req.body &&
    req.body.title &&
    req.body.description &&
    req.body.count !== undefined &&
    req.body.price
  ) {
    try {
      const product: IProduct = {
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        count: req.body.count,
      };
      const newProduct = await createProduct(product, context);
      context.res = {
        status: 201,
        body: newProduct,
      };
    } catch (error) {
      context.log.error("Error creating product:", error);
      context.res = {
        status: 500,
        body: "Error creating product: " + error.message,
      };
    }
  } else {
    context.log("Invalid request body");
    context.res = {
      status: 400,
      body: "Invalid request body",
    };
  }
};

export default httpTrigger;
