import app from "./server";
import location from "./modules/location/location.routes";
import kpi from './modules/kpi/kpi.routes'
import { ErrorHanlder } from "./middleware/errorhanlder";

const PORT = process.env.PORT || 8000;

app.use("/api/locations", location);
app.use("/api/", kpi);

app.use(ErrorHanlder);

app.listen(PORT, () => {
  console.log("server started on port", PORT);
});
