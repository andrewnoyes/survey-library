import * as React from "react";
import { ReactSurveyElement, SurveyQuestionUncontrolledElement } from "./reactquestion_element";
import { QuestionCommentModel } from "survey-core";
import { ReactQuestionFactory } from "./reactquestion_factory";

export class SurveyQuestionComment extends SurveyQuestionUncontrolledElement<QuestionCommentModel> {
  constructor(props: any) {
    super(props);
  }
  protected renderElement(): JSX.Element {
    var cssClasses = this.question.cssClasses;
    var onBlur = !this.question.isInputTextUpdate ? this.updateValueOnEvent : null;
    var onInput = (event: any) => {
      if (this.question.isInputTextUpdate)
        this.updateValueOnEvent(event);
      else
        this.question.updateElement();
    };
    var placeHolder = this.question.renderedPlaceHolder;
    if (this.question.isReadOnlyRenderDiv()) {
      return <div>{this.question.value}</div>;
    }
    return (
      <textarea
        id={this.question.inputId}
        className={cssClasses.root}
        disabled={this.isDisplayMode}
        ref={(tetxarea) => (this.control = tetxarea)}
        maxLength={this.question.getMaxLength()}
        placeholder={placeHolder}
        onBlur={onBlur}
        onInput={onInput}
        cols={this.question.cols}
        rows={this.question.rows}
        aria-required={this.question.ariaRequired}
        aria-label={this.question.ariaLabel}
        aria-invalid={this.question.ariaInvalid}
        aria-describedby={this.question.ariaDescribedBy}
        style={{ resize: this.question.autoGrow ? "none" : "both" }}
      />
    );
  }
}

export class SurveyQuestionCommentItem extends ReactSurveyElement {
  protected canRender(): boolean {
    return !!this.props.question;
  }
  protected renderElement(): JSX.Element {
    let question = this.props.question;
    let className = this.props.otherCss || this.cssClasses.comment;
    let handleOnChange = (event: any) => {
      this.setState({ comment: event.target.value });
    };
    let comment = !!this.state && this.state.comment !== undefined ? this.state.comment : question.comment || "";
    if (question.isReadOnlyRenderDiv()) {
      return <div>{comment}</div>;
    }
    return (
      <textarea
        className={className}
        value={comment}
        disabled={this.isDisplayMode}
        maxLength={question.getOthersMaxLength()}
        placeholder={question.otherPlaceHolder}
        onChange={handleOnChange}
        onBlur={(e) => question.onCommentChange(e)}
        onInput={(e) => question.onCommentInput(e)}
        aria-required={question.isRequired}
        aria-label={question.locTitle.renderedHtml}
        style={{ resize: question.autoGrowComment ? "none" : "both" }}
      />
    );
  }
}

ReactQuestionFactory.Instance.registerQuestion("comment", (props) => {
  return React.createElement(SurveyQuestionComment, props);
});
