import React from 'react'

import { TableOfContents } from '../components/TableOfContents'
import { buildPageTree, loadAllPages, Page, DirectoryNode, parsePage, ParsedPage } from '../lib/api'
import omitUndefinedFields from '../lib/omitUndefinedFields'

// This may be too much; disable it for now.
const showTocInTree = false

function DirectoryItem(props: { node: DirectoryNode<ParsedPage> }): JSX.Element {
    return (
        <li>
            <code>{props.node.name}</code>{' '}
            {props.node.indexPage && (
                <a title={props.node.indexPage.path} href={`/${props.node.indexPage.slugPath}`}>
                    {props.node.indexPage.title || 'Untitled'} {props.node.indexPage.isIndexPage && ' (index.md)'}
                </a>
            )}
            <ul>
                {props.node.pages.map(page => (
                    <li key={page.slugPath}>
                        <code>{page.fileSlug}</code>{' '}
                        <a title={page.path} href={`/${page.slugPath}`}>
                            {page.title || 'Untitled'} (/{page.slugPath}) {page.isIndexPage && ' (index)'}
                        </a>
                        {showTocInTree && (
                            <TableOfContents className="fst-italic" hrefPrefix={`/${page.slugPath}`} toc={page.toc} />
                        )}
                    </li>
                ))}
            </ul>
            <ul>
                {props.node.subdirectories.map(node => (
                    <DirectoryItem key={node.name} node={node} />
                ))}
            </ul>
        </li>
    )
}

interface IndexProps {
    allPages: ParsedPage[]
    tree: DirectoryNode<ParsedPage>
}
export default function Index({ allPages, tree }: IndexProps): JSX.Element {
    return (
        <div className="container">
            <section id="content">
                <h1>Handbook Dashboard</h1>
                <h2>Statistics</h2>
                <p>The handbook contains {allPages.length} pages.</p>
                <h2>Tree view</h2>
                <ul>
                    <DirectoryItem node={tree} />
                </ul>
            </section>
        </div>
    )
}

export async function getStaticProps(): Promise<{ props: { allPages: ParsedPage[]; tree: DirectoryNode<Page> } }> {
    const allPages = await loadAllPages()

    const parsedPages = await Promise.all(allPages.map(page => parsePage(page)))

    const { tree } = buildPageTree<ParsedPage>(parsedPages)
    const root = parsedPages.find(page => page.path === 'index.md')
    if (root) {
        tree.indexPage = root
    }

    return {
        props: omitUndefinedFields({ allPages: parsedPages, tree }),
    }
}
