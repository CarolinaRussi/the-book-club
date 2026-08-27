import "dotenv/config";
import { expireOverdueReadingDraws } from "../services/readingDrawService";

expireOverdueReadingDraws()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
