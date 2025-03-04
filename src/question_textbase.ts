import { Question } from "./question";
import { Serializer } from "./jsonobject";
import { QuestionFactory } from "./questionfactory";
import { LocalizableString } from "./localizablestring";
import { Helpers } from "./helpers";

/**
 * A Base Model for a comment and text questions
 */
export class QuestionTextBase extends Question {
  constructor(name: string) {
    super(name);
    this.createLocalizableString("placeHolder", this);
  }
  protected isTextValue(): boolean {
    return true;
  }
  /**
   * The maximum text length. If it is -1, defaul value, then the survey maxTextLength property will be used.
   * If it is 0, then the value is unlimited
   * @see SurveyModel.maxTextLength
   */
  public get maxLength(): number {
    return this.getPropertyValue("maxLength");
  }
  public set maxLength(val: number) {
    this.setPropertyValue("maxLength", val);
  }
  public getMaxLength(): any {
    return Helpers.getMaxLength(
      this.maxLength,
      this.survey ? this.survey.maxTextLength : -1
    );
  }
  /**
   * Use this property to set the input place holder.
   */
  public get placeHolder(): string {
    return this.getLocalizableStringText("placeHolder");
  }
  public set placeHolder(val: string) {
    this.setLocalizableStringText("placeHolder", val);
    this.calcRenderedPlaceHolder();
  }
  get locPlaceHolder(): LocalizableString {
    return this.getLocalizableString("placeHolder");
  }
  public getType(): string {
    return "textbase";
  }
  isEmpty(): boolean {
    return super.isEmpty() || this.value === "";
  }
  /**
   * Gets or sets a value that specifies how the question updates it's value.
   *
   * The following options are available:
   * - `default` - get the value from survey.textUpdateMode
   * - `onBlur` - the value is updated after an input loses the focus.
   * - `onTyping` - update the value of text questions, "text" and "comment", on every key press.
   *
   * Note, that setting to "onTyping" may lead to a performance degradation, in case you have many expressions in the survey.
   * @see survey.textUpdateMode
   */
  public get textUpdateMode(): string {
    return this.getPropertyValue("textUpdateMode");
  }
  public set textUpdateMode(val: string) {
    this.setPropertyValue("textUpdateMode", val);
  }
  public get isSurveyInputTextUpdate(): boolean {
    if (this.textUpdateMode == "default")
      return !!this.survey ? this.survey.isUpdateValueTextOnTyping : false;
    return this.textUpdateMode == "onTyping";
  }
  public get renderedPlaceHolder(): string {
    return this.getPropertyValue("renderedPlaceHolder");
  }
  protected setRenderedPlaceHolder(val: string) {
    this.setPropertyValue("renderedPlaceHolder", val);
  }
  protected onReadOnlyChanged() {
    super.onReadOnlyChanged();
    this.calcRenderedPlaceHolder();
  }
  endLoadingFromJson() {
    super.endLoadingFromJson();
    this.calcRenderedPlaceHolder();
  }
  public localeChanged() {
    super.localeChanged();
    this.calcRenderedPlaceHolder();
  }
  protected calcRenderedPlaceHolder() {
    this.setRenderedPlaceHolder(
      this.hasPlaceHolder() ? this.placeHolder : undefined
    );
  }
  protected hasPlaceHolder(): boolean {
    return !this.isReadOnly;
  }
}
Serializer.addClass(
  "textbase",
  [],
  function() {
    return new QuestionTextBase("");
  },
  "question"
);
