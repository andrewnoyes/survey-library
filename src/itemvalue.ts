import { ILocalizableOwner, LocalizableString } from "./localizablestring";
import {
  JsonObject,
  JsonObjectProperty,
  Serializer,
  CustomPropertiesCollection,
} from "./jsonobject";
import { Helpers } from "./helpers";
import { ConditionRunner } from "./conditions";
import { Base } from "./base";
import { ISurvey } from "./base-interfaces";
import { settings } from "./settings";

/**
 * Array of ItemValue is used in checkox, dropdown and radiogroup choices, matrix columns and rows.
 * It has two main properties: value and text. If text is empty, value is used for displaying.
 * The text property is localizable and support markdown.
 */
export class ItemValue extends Base {
  [index: string]: any;
  public static get Separator() {
    return settings.itemValueSeparator;
  }
  public static set Separator(val: string) {
    settings.itemValueSeparator = val;
  }
  public static createArray(locOwner: ILocalizableOwner): Array<ItemValue> {
    var items: Array<ItemValue> = [];
    ItemValue.setupArray(items, locOwner);
    return items;
  }
  public static setupArray(
    items: Array<ItemValue>,
    locOwner: ILocalizableOwner
  ) {
    items.push = function(value): number {
      var result = Array.prototype.push.call(this, value);
      value.locOwner = locOwner;
      return result;
    };
    items.unshift = function(value): number {
      var result = Array.prototype.unshift.call(this, value);
      value.locOwner = locOwner;
      return result;
    };
    items.splice = function(
      start?: number,
      deleteCount?: number,
      ...items: ItemValue[]
    ): ItemValue[] {
      var result = Array.prototype.splice.call(
        this,
        start,
        deleteCount,
        ...items
      );
      if (!items) items = [];
      for (var i = 0; i < items.length; i++) {
        items[i].locOwner = locOwner;
      }
      return result;
    };
  }
  public static setData(items: Array<ItemValue>, values: Array<any>) {
    items.length = 0;
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      var item: ItemValue;
      if (typeof value.getType === "function") {
        item = Serializer.createClass(value.getType());
      } else {
        item = new ItemValue(null);
      }
      item.setData(value);
      if (!!value.originalItem) {
        item.originalItem = value.originalItem;
      }
      items.push(item);
    }
  }
  public static getData(items: Array<ItemValue>): any {
    var result = [];
    for (var i = 0; i < items.length; i++) {
      result.push(items[i].getData());
    }
    return result;
  }
  public static getItemByValue(items: Array<ItemValue>, val: any): ItemValue {
    if (!Array.isArray(items)) return null;
    const valIsEmpty = Helpers.isValueEmpty(val);
    for (var i = 0; i < items.length; i++) {
      if (valIsEmpty && Helpers.isValueEmpty(items[i].value)) return items[i];
      if (Helpers.isTwoValueEquals(items[i].value, val)) return items[i];
    }
    return null;
  }
  public static getTextOrHtmlByValue(
    items: Array<ItemValue>,
    val: any
  ): string {
    var item = ItemValue.getItemByValue(items, val);
    return item !== null ? item.locText.textOrHtml : "";
  }
  public static locStrsChanged(items: Array<ItemValue>) {
    for (var i = 0; i < items.length; i++) {
      items[i].locStrsChanged();
    }
  }
  public static runConditionsForItems(
    items: Array<ItemValue>,
    filteredItems: Array<ItemValue>,
    runner: ConditionRunner,
    values: any,
    properties: any,
    useItemExpression: boolean = true
  ): boolean {
    return ItemValue.runConditionsForItemsCore(
      items,
      filteredItems,
      runner,
      values,
      properties,
      true,
      useItemExpression
    );
  }
  public static runEnabledConditionsForItems(
    items: Array<ItemValue>,
    runner: ConditionRunner,
    values: any,
    properties: any,
    onItemCallBack?: (item: ItemValue) => boolean
  ): boolean {
    return ItemValue.runConditionsForItemsCore(
      items,
      null,
      runner,
      values,
      properties,
      false,
      true,
      onItemCallBack
    );
  }
  private static runConditionsForItemsCore(
    items: Array<ItemValue>,
    filteredItems: Array<ItemValue>,
    runner: ConditionRunner,
    values: any,
    properties: any,
    isVisible: boolean,
    useItemExpression: boolean = true,
    onItemCallBack?: (item: ItemValue) => boolean
  ): boolean {
    if (!values) {
      values = {};
    }
    var itemValue = values["item"];
    var choiceValue = values["choice"];
    var hasChanded = false;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      values["item"] = item.value;
      values["choice"] = item.value;
      var itemRunner =
        useItemExpression && !!item.getConditionRunner
          ? item.getConditionRunner(isVisible)
          : false;
      if (!itemRunner) {
        itemRunner = runner;
      }
      var newValue = true;
      if (itemRunner) {
        newValue = itemRunner.run(values, properties);
      }
      if (newValue && !!onItemCallBack) {
        newValue = onItemCallBack(item);
      }
      if (!!filteredItems && newValue) {
        filteredItems.push(item);
      }
      var oldValue = isVisible ? item.isVisible : item.isEnabled;
      if (newValue != oldValue) {
        hasChanded = true;
        if (isVisible) {
          if (!!item.setIsVisible) item.setIsVisible(newValue);
        } else {
          if (!!item.setIsEnabled) item.setIsEnabled(newValue);
        }
      }
    }
    if (itemValue) {
      values["item"] = itemValue;
    } else {
      delete values["item"];
    }
    if (choiceValue) {
      values["choice"] = choiceValue;
    } else {
      delete values["choice"];
    }
    return hasChanded;
  }
  public ownerPropertyName: string = "";
  //private itemValue: any;
  private locTextValue: LocalizableString;
  private isVisibleValue: boolean = true;
  private visibleConditionRunner: ConditionRunner;
  private enableConditionRunner: ConditionRunner;

  constructor(
    value: any,
    text: string = null,
    protected typeName = "itemvalue"
  ) {
    super();
    this.locTextValue = new LocalizableString(null, true);
    this.locTextValue.onStrChanged = (oldValue: string, newValue: string) => {
      if (newValue == this.value) {
        newValue = undefined;
      }
      this.propertyValueChanged("text", oldValue, newValue);
    };
    this.locTextValue.onGetTextCallback = (txt) => {
      return txt
        ? txt
        : !Helpers.isValueEmpty(this.value)
          ? this.value.toString()
          : null;
    };
    if (text) this.locText.text = text;
    if (!!value && typeof value === "object") {
      this.setData(value);
    } else {
      this.value = value;
    }
    if (this.getType() != "itemvalue") {
      CustomPropertiesCollection.createProperties(this);
    }
    this.onCreating();
  }

  public onCreating(): any {}
  public getType(): string {
    return !!this.typeName ? this.typeName : "itemvalue";
  }
  public getSurvey(live: boolean = false): ISurvey {
    return !!this.locOwner && !!(<any>this.locOwner)["getSurvey"]
      ? (<any>this.locOwner).getSurvey()
      : null;
  }
  public getLocale(): string {
    return (this.locText && this.locText.locale) || "";
  }
  public get locText(): LocalizableString {
    return this.locTextValue;
  }
  setLocText(locText: LocalizableString) {
    this.locTextValue = locText;
  }
  public get locOwner(): ILocalizableOwner {
    return this.locText.owner;
  }
  public set locOwner(value: ILocalizableOwner) {
    this.locText.owner = value;
  }
  public get value(): any {
    return this.getPropertyValue("value");
  }
  public set value(newValue: any) {
    var text: string = undefined;
    if (!Helpers.isValueEmpty(newValue)) {
      var str: string = newValue.toString();
      var index = str.indexOf(settings.itemValueSeparator);
      if (index > -1) {
        newValue = str.slice(0, index);
        text = str.slice(index + 1);
      }
    }
    this.setPropertyValue("value", newValue);
    if (!!text) {
      this.text = text;
    }
  }
  public get hasText(): boolean {
    return this.locText.pureText ? true : false;
  }
  public get pureText(): string {
    return this.locText.pureText;
  }
  public set pureText(val: string) {
    this.text = val;
  }
  public get text(): string {
    return this.locText.calculatedText; //TODO: it will be correct to use this.locText.text, however it would require a lot of rewriting in Creator
  }
  public set text(newText: string) {
    this.locText.text = newText;
  }
  public get calculatedText() {
    return this.locText.calculatedText;
  }
  public getData(): any {
    var json = this.toJSON();
    if (!!json["value"] && !!json["value"]["pos"]) {
      delete json["value"]["pos"];
    }
    if (Object.keys(json).length == 1 && !Helpers.isValueEmpty(json["value"]))
      return this.value;
    return json;
  }
  public toJSON(): any {
    var res = {};
    var properties = Serializer.getProperties(this.getType());
    if (!properties || properties.length == 0) {
      properties = Serializer.getProperties("itemvalue");
    }
    var jsoObj = new JsonObject();
    for (var i = 0; i < properties.length; i++) {
      jsoObj.valueToJson(this, res, properties[i]);
    }
    return res;
  }
  public setData(value: any) {
    if (Helpers.isValueEmpty(value)) return;
    if (typeof value.value !== "undefined") {
      var json = value;
      if (typeof value.toJSON === "function") {
        json = (<Base>value).toJSON();
      }
      new JsonObject().toObject(json, this);
    } else {
      this.value = value;
    }
    this.locText.strChanged();
  }
  public get visibleIf(): string {
    return this.getPropertyValue("visibleIf", "");
  }
  public set visibleIf(val: string) {
    this.setPropertyValue("visibleIf", val);
  }
  public get enableIf(): string {
    return this.getPropertyValue("enableIf", "");
  }
  public set enableIf(val: string) {
    this.setPropertyValue("enableIf", val);
  }
  public get isVisible() {
    return this.isVisibleValue;
  }
  public setIsVisible(val: boolean) {
    this.isVisibleValue = val;
  }
  public get isEnabled() {
    return this.getPropertyValue("isEnabled", true);
  }
  public setIsEnabled(val: boolean) {
    this.setPropertyValue("isEnabled", val);
  }
  public addUsedLocales(locales: Array<string>) {
    this.AddLocStringToUsedLocales(this.locTextValue, locales);
  }
  public locStrsChanged() {
    super.locStrsChanged();
    this.locText.strChanged();
  }
  protected onPropertyValueChanged(name: string, oldValue: any, newValue: any) {
    if (name === "value" && !this.hasText) {
      this.locText.onChanged();
    }
    var funcName = "itemValuePropertyChanged";
    if (!this.locOwner || !(<any>this.locOwner)[funcName]) return;
    (<any>this.locOwner)[funcName](this, name, oldValue, newValue);
  }
  protected getConditionRunner(isVisible: boolean) {
    if (isVisible) return this.getVisibleConditionRunner();
    return this.getEnableConditionRunner();
  }
  private getVisibleConditionRunner(): ConditionRunner {
    if (!this.visibleIf) return null;
    if (!this.visibleConditionRunner)
      this.visibleConditionRunner = new ConditionRunner(this.visibleIf);
    this.visibleConditionRunner.expression = this.visibleIf;
    return this.visibleConditionRunner;
  }
  private getEnableConditionRunner(): ConditionRunner {
    if (!this.enableIf) return null;
    if (!this.enableConditionRunner)
      this.enableConditionRunner = new ConditionRunner(this.enableIf);
    this.enableConditionRunner.expression = this.enableIf;
    return this.enableConditionRunner;
  }
  public originalItem: any;
}

Base.createItemValue = function(source: any, type?: string): any {
  var item = null;
  if (!!type) {
    item = JsonObject.metaData.createClass(type, {});
  } else if (typeof source.getType === "function") {
    item = new ItemValue(null, undefined, source.getType());
  } else {
    item = new ItemValue(null);
  }
  item.setData(source);
  return item;
};
Base.itemValueLocStrChanged = function(arr: Array<any>): void {
  ItemValue.locStrsChanged(arr);
};
JsonObjectProperty.getItemValuesDefaultValue = function(val: any): any {
  var res = new Array<ItemValue>();
  ItemValue.setData(res, val || []);
  return res;
};

Serializer.addClass(
  "itemvalue",
  [
    "!value",
    {
      name: "text",
      serializationProperty: "locText",
    },
    { name: "visibleIf:condition", showMode: "form" },
    {
      name: "enableIf:condition",
      showMode: "form",
      visibleIf: (obj: ItemValue): boolean => {
        return !obj || obj.ownerPropertyName !== "rateValues";
      },
    },
  ],
  (value: any) => new ItemValue(value)
);
