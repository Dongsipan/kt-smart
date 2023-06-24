/**
 * 轨迹优化工具类
 * <p>
 * 使用方法：
 * <p>
 *     const pathSmoothTool = new PathSmoothTool();
 *     pathSmoothTool.setIntensity(2);//设置滤波强度，默认3
 *     const mList<LatLng[]> = pathSmoothTool.kalmanFilterPath(list);
 */

export class PathSmoothTool {
  private mIntensity = 3;
  private mThreshhold = 0.3;
  private mNoiseThreshhold = 10;
  /***************************卡尔曼滤波开始********************************/
  private lastLocation_x = 0; //上次位置
  private currentLocation_x = 0; //这次位置
  private lastLocation_y = 0; //上次位置
  private currentLocation_y = 0; //这次位置
  private estimate_x = 0; //修正后数据
  private estimate_y = 0; //修正后数据
  private pdelt_x = 0.001; //自预估偏差
  private pdelt_y = 0.001; //自预估偏差
  private mdelt_x = 5.698402909980532e-4; //上次模型偏差
  private mdelt_y = 5.698402909980532e-4; //上次模型偏差
  private gauss_x = 0; //高斯噪音偏差
  private gauss_y = 0; //高斯噪音偏差
  private kalmanGain_x = 0; //卡尔曼增益
  private kalmanGain_y = 0; //卡尔曼增益

  private m_R = 0;
  private m_Q = 0;

  constructor() {}

  public getIntensity() {
    return this.mIntensity;
  }

  /***************************卡尔曼滤波结束**********************************/

  public setIntensity(mIntensity: number) {
    this.mIntensity = mIntensity;
  }

  public getThreshhold() {
    return this.mThreshhold;
  }

  public setThreshhold(mThreshhold: number) {
    this.mThreshhold = mThreshhold;
  }

  public setNoiseThreshhold(mnoiseThreshhold: number) {
    this.mNoiseThreshhold = mnoiseThreshhold;
  }

  /**
   * 轨迹平滑优化
   * @param originlist 原始轨迹list,list.size大于2
   * @return 优化后轨迹list
   */
  public pathOptimize(originlist: AMap.LngLat[]) {
    const list = this.removeNoisePoint(originlist) as AMap.LngLat[]; //去噪
    const afterList = this.kalmanFilterPath(list) as AMap.LngLat[]; //滤波
    const pathoptimizeList = this.reducerVerticalThreshold(
      afterList
    ) as AMap.LngLat[]; //抽稀
    return pathoptimizeList;
  }

  /**
   * 轨迹线路滤波
   * @param originlist 原始轨迹list,list.size大于2
   * @return 滤波处理后的轨迹list
   */
  public kalmanFilterPath(originlist: AMap.LngLat[]) {
    return this._kalmanFilterPath(originlist, this.mIntensity);
  }

  /**
   * 轨迹去噪，删除垂距大于20m的点
   * @param originlist 原始轨迹list,list.size大于2
   * @return
   */
  public removeNoisePoint(originlist: AMap.LngLat[]) {
    return this._reduceNoisePoint(originlist, this.mNoiseThreshhold);
  }

  /**
   * 单点滤波
   * @param lastLoc 上次定位点坐标
   * @param curLoc 本次定位点坐标
   * @return 滤波后本次定位点坐标值
   */
  public kalmanFilterPoint(lastLoc: AMap.LngLat, curLoc: AMap.LngLat) {
    return this._kalmanFilterPoint(lastLoc, curLoc, this.mIntensity);
  }

  /**
   * 轨迹抽稀
   * @param inPoints 待抽稀的轨迹list，至少包含两个点，删除垂距小于mThreshhold的点
   * @return 抽稀后的轨迹list
   */
  public reducerVerticalThreshold(inPoints: AMap.LngLat[]) {
    return this._reducerVerticalThreshold(inPoints, this.mThreshhold);
  }

  //初始模型
  private initial = () => {
    this.pdelt_x = 0.001;
    this.pdelt_y = 0.001;
    //        mdelt_x = 0;
    //        mdelt_y = 0;
    this.mdelt_x = 5.698402909980532e-4;
    this.mdelt_y = 5.698402909980532e-4;
  };

  private kalmanFilter(
    oldValue_x: number,
    value_x: number,
    oldValue_y: number,
    value_y: number
  ) {
    this.lastLocation_x = oldValue_x;
    this.currentLocation_x = value_x;
    this.gauss_x =
      Math.sqrt(this.pdelt_x * this.pdelt_x + this.mdelt_x * this.mdelt_x) +
      this.m_Q; //计算高斯噪音偏差
    this.kalmanGain_x =
      Math.sqrt(
        (this.gauss_x * this.gauss_x) /
          (this.gauss_x * this.gauss_x + this.pdelt_x * this.pdelt_x)
      ) + this.m_R; //计算卡尔曼增益
    this.estimate_x =
      this.kalmanGain_x * (this.currentLocation_x - this.lastLocation_x) +
      this.lastLocation_x; //修正定位点
    this.mdelt_x = Math.sqrt(
      (1 - this.kalmanGain_x) * this.gauss_x * this.gauss_x
    ); //修正模型偏差

    this.lastLocation_y = oldValue_y;
    this.currentLocation_y = value_y;
    this.gauss_y =
      Math.sqrt(this.pdelt_y * this.pdelt_y + this.mdelt_y * this.mdelt_y) +
      this.m_Q; //计算高斯噪音偏差
    this.kalmanGain_y =
      Math.sqrt(
        (this.gauss_y * this.gauss_y) /
          (this.gauss_y * this.gauss_y + this.pdelt_y * this.pdelt_y)
      ) + this.m_R; //计算卡尔曼增益
    this.estimate_y =
      this.kalmanGain_y * (this.currentLocation_y - this.lastLocation_y) +
      this.lastLocation_y; //修正定位点
    this.mdelt_y = Math.sqrt(
      (1 - this.kalmanGain_y) * this.gauss_y * this.gauss_y
    ); //修正模型偏差

    return new AMap.LngLat(this.estimate_x, this.estimate_y);
  }

  /********************************************************************************************************/
  /**
   * 轨迹线路滤波
   * @param originlist 原始轨迹list,list.size大于2
   * @param intensity 滤波强度（1—5）
   * @return
   */
  private _kalmanFilterPath(originlist: AMap.LngLat[], intensity: number) {
    const kalmanFilterList = [] as AMap.LngLat[];
    if (!originlist || originlist.length <= 2) return kalmanFilterList;
    this.initial(); //初始化滤波参数
    let latLng;
    const lastLoc = originlist[0];
    kalmanFilterList.push(lastLoc);
    originlist.forEach((curLoc, index) => {
      latLng = this._kalmanFilterPoint(lastLoc, curLoc, intensity);
      if (latLng !== null) {
        kalmanFilterList.push(latLng!);
      }
    });
    return kalmanFilterList;
  }

  /**
   * 单点滤波
   * @param lastLoc 上次定位点坐标
   * @param curLoc 本次定位点坐标
   * @param intensity 滤波强度（1—5）
   * @return 滤波后本次定位点坐标值
   */
  private _kalmanFilterPoint(
    lastLoc: AMap.LngLat,
    curLoc: AMap.LngLat,
    intensity: number
  ) {
    if (this.pdelt_x == 0 || this.pdelt_y == 0) {
      this.initial();
    }
    let kalmanLatlng;
    if (lastLoc == null || curLoc == null) {
      return kalmanLatlng;
    }
    if (intensity < 1) {
      intensity = 1;
    } else if (intensity > 5) {
      intensity = 5;
    }

    for (let j = 0; j < intensity; j++) {
      kalmanLatlng = this.kalmanFilter(
        lastLoc.lng,
        curLoc.lng,
        lastLoc.lat,
        curLoc.lat
      );
      curLoc = kalmanLatlng;
    }
    return kalmanLatlng;
  }

  /***************************抽稀算法*************************************/
  private _reducerVerticalThreshold(
    inPoints: AMap.LngLat[],
    threshHold: number
  ) {
    if (inPoints == null) {
      return null;
    }
    if (inPoints.length <= 2) {
      return inPoints;
    }
    const ret = [];
    for (let i = 0; i < inPoints.length; i++) {
      const pre = this.getLastLocation(ret);
      const cur = inPoints[i];
      if (pre === null || i === inPoints.length - 1) {
        ret.push(cur);
        continue;
      }
      const next = inPoints[i + 1];
      const distance = this.calculateDistanceFromPoint(cur, pre, next);
      if (distance > threshHold) {
        ret.push(cur);
      }
    }
    return ret;
  }

  private getLastLocation(oneGraspList: AMap.LngLat[] | null) {
    if (oneGraspList == null || oneGraspList.length == 0) {
      return null;
    }
    const locListSize = oneGraspList.length;
    return oneGraspList[locListSize - 1];
  }

  /**
   * 计算当前点到线的垂线距离
   * @param p 当前点
   * @param lineBegin 线的起点
   * @param lineEnd 线的终点
   *
   */
  private calculateDistanceFromPoint(
    p: AMap.LngLat,
    lineBegin: AMap.LngLat,
    lineEnd: AMap.LngLat
  ) {
    const A = p.lng - lineBegin.lng;
    const B = p.lat - lineBegin.lat;
    const C = lineEnd.lng - lineBegin.lng;
    const D = lineEnd.lat - lineBegin.lat;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = dot / len_sq;

    let xx, yy;

    if (
      param < 0 ||
      (lineBegin.lng === lineEnd.lng && lineBegin.lat === lineEnd.lat)
    ) {
      xx = lineBegin.lng;
      yy = lineBegin.lat;
      //            return -1;
    } else if (param > 1) {
      xx = lineEnd.lng;
      yy = lineEnd.lat;
      //            return -1;
    } else {
      xx = lineBegin.lng + param * C;
      yy = lineBegin.lat + param * D;
    }
    return window.AMap.GeometryUtil.distance(p, new AMap.LngLat(xx, yy)); // AMapUtils.calculateLineDistance(p,new LatLng(yy,xx));
  }

  /***************************抽稀算法结束*********************************/

  private _reduceNoisePoint(inPoints: AMap.LngLat[], threshHold: number) {
    if (inPoints == null) {
      return null;
    }
    if (inPoints.length <= 2) {
      return inPoints;
    }
    const ret = [];
    for (let i = 0; i < inPoints.length; i++) {
      const pre = this.getLastLocation(ret);
      const cur = inPoints[i];
      if (pre == null || i == inPoints.length - 1) {
        ret.push(cur);
        continue;
      }
      const next = inPoints[i + 1];
      const distance = this.calculateDistanceFromPoint(cur, pre, next);
      if (distance < threshHold) {
        ret.push(cur);
      }
    }
    return ret;
  }
}
