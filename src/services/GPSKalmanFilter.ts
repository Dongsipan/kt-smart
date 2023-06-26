class GPSKalmanFilter {
  // Decay in m/s - 3 is a good number for walking pace,
  // ideally change decay to 11 m/s for travel at 40kmh
  // or change to 25 m/s for travel at 100kmh
  private readonly decay: number;
  private variance: number;
  private readonly minAccuracy: number;
  private timestampInMs: number;
  private lat: number;
  private lon: number;

  constructor(decay = 3) {
    this.decay = decay;
    this.variance = -1;
    this.minAccuracy = 1;
    this.timestampInMs = 0;
    this.lat = 0;
    this.lon = 0;
  }

  // Kalman filter processing for latitude and longitude
  //
  // lat = new measurement of latitude
  // lon = new measurement of longitude
  // accuracy = measurement of 1 standard deviation error in metres
  // timestampInMs = time of measurement from geolocation service
  //
  // This returns a new filtered X Y geolocation
  //
  filter(lat: number, lon: number, accuracy: number, timestampInMs: number) {
    if (accuracy < this.minAccuracy) accuracy = this.minAccuracy;
    //console.log('accuracy is',accuracy)

    // if variance < 0, object is unitialised, so initialise with current values
    if (this.variance < 0) {
      //console.log('initialised values')
      this.timestampInMs = timestampInMs;
      this.lat = lat;
      this.lon = lon;
      this.variance = accuracy * accuracy;
    }

    // else apply Kalman filter methodology
    else {
      //console.log('applying kalman filtering now')
      const timeIncMs = timestampInMs - this.timestampInMs;

      // time has moved on, so the uncertainty in the current position increases
      if (timeIncMs > 0) {
        this.variance += (timeIncMs * this.decay * this.decay) / 1000;
        this.timestampInMs = timestampInMs;
      }
      // TODO: USE VELOCITY INFORMATION HERE TO GET A BETTER ESTIMATE OF CURRENT POSITION ?

      // Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
      // NB: because K is dimensionless, it doesn't matter that variance has different units to lat and lon
      const _k = this.variance / (this.variance + accuracy * accuracy);
      this.lat += _k * (lat - this.lat);
      this.lon += _k * (lon - this.lon);

      // new Covarariance  matrix is (IdentityMatrix - K) * Covarariance
      this.variance = (1 - _k) * this.variance;
    }

    return [this.lon, this.lat];
  }
}

export default GPSKalmanFilter;
