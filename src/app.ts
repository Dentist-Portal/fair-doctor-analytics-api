import "dotenv/config";
import app from "./server";
import kpiRoutes from "./modules/kpi/kpi.routes";
import locationRoutes from "./modules/location/location.routes";
import { errorHandler } from "./middleware/errorhanlder";

const PORT = process.env.PORT || 8000;

app.use("/api/locations", locationRoutes);
app.use("/api", kpiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server started on port", PORT);
});
