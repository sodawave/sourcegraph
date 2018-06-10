import BookClosedIcon from '@sourcegraph/icons/lib/BookClosed'
import CloseIcon from '@sourcegraph/icons/lib/Close'
import DraftsIcon from '@sourcegraph/icons/lib/Drafts'
import LinkIcon from '@sourcegraph/icons/lib/Link'
import StarIcon from '@sourcegraph/icons/lib/Star'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { fromEvent, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as GQL from '../backend/graphqlschema'

interface Props {
    user: GQL.IUser | null
    onDismiss: () => void
}

export class HelpPopover extends React.Component<Props> {
    private static LINKS: { title: string; description: string; template: string }[] = [
        { title: 'Bug report', description: 'Report problems and unexpected behavior', template: 'bug_report.md' },
        { title: 'Feature request', description: 'Suggest an idea for Sourcegraph', template: 'feature_request.md' },
        { title: 'Question', description: 'Ask a question about Sourcegraph', template: 'question.md' },
    ]

    private subscriptions = new Subscription()

    public componentDidMount(): void {
        // ESC hides component.
        this.subscriptions.add(
            fromEvent<KeyboardEvent>(window, 'keydown')
                .pipe(filter(event => event.key === 'Escape'))
                .subscribe(() => this.props.onDismiss())
        )
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element {
        return (
            <div className="help-popover card">
                <h4 className="card-header d-flex justify-content-between pl-3">
                    Help
                    <button
                        type="reset"
                        className="btn btn-icon help-popover__close"
                        onClick={this.props.onDismiss}
                        title="Close"
                    >
                        <CloseIcon />
                    </button>
                </h4>
                <div className="list-group list-group-flush">
                    <a
                        className="list-group-item list-group-item-action px-3 py-2"
                        href="https://about.sourcegraph.com/docs/search/query-syntax"
                        target="_blank"
                    >
                        <StarIcon className="icon-inline" /> How to search
                    </a>
                    <a
                        className="list-group-item list-group-item-action px-3 py-2"
                        href="https://about.sourcegraph.com/docs"
                        target="_blank"
                    >
                        <BookClosedIcon className="icon-inline" /> Sourcegraph documentation
                    </a>
                    <a
                        className="list-group-item list-group-item-action px-3 py-2"
                        href="https://github.com/sourcegraph/issues/issues"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <LinkIcon className="icon-inline" /> Public issue tracker
                    </a>
                    <a
                        className="list-group-item list-group-item-action px-3 py-2"
                        href="https://about.sourcegraph.com/contact"
                        target="_blank"
                    >
                        <DraftsIcon className="icon-inline" /> Contact Sourcegraph
                    </a>
                </div>
                <h4 className="card-header pl-3">File a public issue...</h4>
                <div className="list-group list-group-flush">
                    {HelpPopover.LINKS.map(({ title, description, template }, i) => (
                        <Link
                            className="list-group-item list-group-item-action px-3 py-2"
                            key={i}
                            to={`https://github.com/sourcegraph/issues/issues/new?template=${template}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <strong>{title} &raquo;</strong>
                            <br />
                            <small className="text-muted">{description}</small>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }
}