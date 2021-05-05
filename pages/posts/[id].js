import Layout from '../../components/layout'
import Head from 'next/head'
import { getAllPostIds, getPostData } from '../../lib/posts'
import Date from '../../components/date'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"
import gfm from 'remark-gfm'




export async function getStaticPaths() {
    const paths = getAllPostIds()
    return {
        paths,
        fallback: false
    }
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id)
    return {
        props: {
            postData
        }
    }
}

const CodeBlock = ({ language, value }) => {
    return (
        <SyntaxHighlighter
            language={language}
            style={tomorrow}
            wrapLines={true}
            showLineNumbers={true}
        >
            {value}
        </SyntaxHighlighter>
    )
}

export default function Post({ postData }) {
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className="mt-6">{postData.title}</h1>
                <div className="text-gray-500">
                    <Date dateString={postData.date} />
                </div>
                <ReactMarkdown
                    children={postData.content}
                    remarkPlugins={[gfm]}
                />
                {/* <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} /> */}
            </article>
        </Layout >
    )
}