import * as ko from "knockout";
import { ActionContainer } from "survey-core";
import { ImplementorBase } from "../../kobase";

const template = require("./action-bar.html");

export * from "./action";
export * from "./action-bar-item";
export * from "./action-bar-item-dropdown";
export * from "./action-bar-separator";

export class ActionBarViewModel extends ActionContainer {
  private _implementor: ImplementorBase;
  constructor(public model: ActionContainer, public handleClick = true) {
    super();
    this._implementor = new ImplementorBase(model);
  }

  dispose(): void {
    super.dispose();
    this._implementor.dispose();
    this.model.dispose();
  }
}

export class AdaptiveElementImplementor extends ImplementorBase {
  private itemsSubscription: any;

  constructor(model: ActionContainer) {
    super(model);

    this.itemsSubscription = ko.computed(() => {
      ((<any>model).renderedActions || (<any>model).items || (<any>model).actions).forEach((item: any) => {
        if (!!item.stateItem) {
          new ImplementorBase(item.stateItem);
        } else {
          new ImplementorBase(item);
        }
      });
    });
  }

  dispose() {
    super.dispose();
    this.itemsSubscription.dispose();
  }
}

ko.components.register("sv-action-bar", {
  viewModel: {
    createViewModel: (params: any, componentInfo: any) => {
      const handleClick =
        params.handleClick !== undefined ? params.handleClick : true;
      const model = params.model;
      const container: HTMLDivElement =
        componentInfo.element.nextElementSibling;
      params.model.initResponsivityManager(container);
      return new ActionBarViewModel(model, handleClick);
    },
  },
  template: template,
});
