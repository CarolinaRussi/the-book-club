import "dotenv/config";
import { autoCompleteOverdueMeetings } from "../services/meetingService";

autoCompleteOverdueMeetings()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
