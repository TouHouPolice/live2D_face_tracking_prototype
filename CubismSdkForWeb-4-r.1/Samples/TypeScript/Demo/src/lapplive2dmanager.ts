/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Live2DCubismFramework as cubismmatrix44 } from "@framework/math/cubismmatrix44";
import { Live2DCubismFramework as csmvector } from "@framework/type/csmvector";
import { Live2DCubismFramework as acubismmotion } from "@framework/motion/acubismmotion";
import Csm_csmVector = csmvector.csmVector;
import Csm_CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import ACubismMotion = acubismmotion.ACubismMotion;

import { LAppModel } from "./lappmodel";
import { LAppPal } from "./lapppal";
import { canvas } from "./lappdelegate";
import * as LAppDefine from "./lappdefine";

export let s_instance: LAppLive2DManager = null;

/**
 * サンプルアプリケーションにおいてCubismModelを管理するクラス
 * モデル生成と破棄、タップイベントの処理、モデル切り替えを行う。
 */
export class LAppLive2DManager {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   */
  public static getInstance(): LAppLive2DManager {
    if (s_instance == null) {
      s_instance = new LAppLive2DManager();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance = void 0;
    }

    s_instance = null;
  }

  /**
   * 現在のシーンで保持しているモデルを返す。
   *
   * @param no モデルリストのインデックス値
   * @return モデルのインスタンスを返す。インデックス値が範囲外の場合はNULLを返す。
   */
  public getModel(no: number): LAppModel {
    if (no < this._models.getSize()) {
      return this._models.at(no);
    }

    return null;
  }

  /**
   * 現在のシーンで保持しているすべてのモデルを解放する
   */
  public releaseAllModel(): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      this._models.at(i).release();
      this._models.set(i, null);
    }

    this._models.clear();
  }

  /**
   * 画面をドラッグした時の処理
   *
   * @param x 画面のX座標
   * @param y 画面のY座標
   */
  public onDrag(x: number, y: number): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      const model: LAppModel = this.getModel(i);

      if (model) {
        model.setDragging(x, y);
      }
    }
  }

  /**
   * 画面をタップした時の処理
   *
   * @param x 画面のX座標
   * @param y 画面のY座標
   */
  public onTap(x: number, y: number): void {
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(
        `[APP]tap point: {x: ${x.toFixed(2)} y: ${y.toFixed(2)}}`
      );
    }

    for (let i: number = 0; i < this._models.getSize(); i++) {
      if (this._models.at(i).hitTest(LAppDefine.HitAreaNameHead, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(
            `[APP]hit area: [${LAppDefine.HitAreaNameBody}]`
          );
        }
        console.log("expression set");
        this._models.at(i).setRandomExpression();
      } else if (this._models.at(i).hitTest(LAppDefine.HitAreaNameBody, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(
            `[APP]hit area: [${LAppDefine.HitAreaNameBody}]`
          );
        }
        console.log("motion set");

        this._models
          .at(i)
          .startRandomMotion(
            LAppDefine.MotionGroupTapBody,
            LAppDefine.PriorityNormal
          );
      }

      // ここから追加
      else if (this._models.at(i).hitTest("Right", x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(
            `[APP]hit area: [${LAppDefine.HitAreaNameBody}]`
          );
        }
        this._models
          .at(i)
          .startRandomRightHandMotion("Right", LAppDefine.PriorityForce);
      } else if (this._models.at(i).hitTest("Left", x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(
            `[APP]hit area: [${LAppDefine.HitAreaNameBody}]`
          );
        }
        this._models
          .at(i)
          .startRandomLeftHandMotion("Left", LAppDefine.PriorityForce);
      }
      // ここまで追加
    }
  }

  /**
   * 画面を更新するときの処理
   * モデルの更新処理及び描画処理を行う
   */
  public onUpdate(): void {
    let projection: Csm_CubismMatrix44 = new Csm_CubismMatrix44();

    const { width, height } = canvas;
    projection.scale(1.0, width / height);

    if (this._viewMatrix != null) {
      projection.multiplyByMatrix(this._viewMatrix);
    }

    const saveProjection: Csm_CubismMatrix44 = projection.clone();
    const modelCount: number = this._models.getSize();

    for (let i = 0; i < modelCount; ++i) {
      const model: LAppModel = this.getModel(i);
      projection = saveProjection.clone();

      model.update();
      model.draw(projection); // 参照渡しなのでprojectionは変質する。
    }
  }

  /**
   * 次のシーンに切りかえる
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   */
  public nextScene(): void {
    const no: number = (this._sceneIndex + 1) % LAppDefine.ModelDirSize;
    this.changeScene(no);
  }

  /**
   * シーンを切り替える
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   */
  public changeScene(index: number): void {
    this._sceneIndex = index;
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(`[APP]model index: ${this._sceneIndex}`);
    }

    // ModelDir[]に保持したディレクトリ名から
    // model3.jsonのパスを決定する。
    // ディレクトリ名とmodel3.jsonの名前を一致させておくこと。
    const model: string = LAppDefine.ModelDir[index];
    const modelPath: string = LAppDefine.ResourcesPath + model + "/";
    let modelJsonName: string = LAppDefine.ModelDir[index];
    modelJsonName += ".model3.json";

    this.releaseAllModel();
    this._models.pushBack(new LAppModel());
    this._models.at(0).loadAssets(modelPath, modelJsonName);
  }

  /**
   * コンストラクタ
   */
  constructor() {
    this._viewMatrix = new Csm_CubismMatrix44();
    this._models = new Csm_csmVector<LAppModel>();
    this._sceneIndex = 1; //model seletion
    this.changeScene(this._sceneIndex);
  }

  _viewMatrix: Csm_CubismMatrix44; // モデル描画に用いるview行列
  _models: Csm_csmVector<LAppModel>; // モデルインスタンスのコンテナ
  _sceneIndex: number; // 表示するシーンのインデックス値
  // モーション再生終了のコールバック関数
  _finishedMotion = (self: ACubismMotion): void => {
    LAppPal.printMessage("Motion Finished:");
    console.log(self);
  };
}
