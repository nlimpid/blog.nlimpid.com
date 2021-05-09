import Layout from '../../components/layout'
import Head from 'next/head'
import { getAllPostIds, getPostData } from '../../lib/posts'
import Date from '../../components/date'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"


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

export default function Post({ postData }) {
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article >
                <h1 className="mt-6">{postData.title}</h1>
                <div className="text-gray-500 divide-y divide-gray-200 xl:pb-0 xl:col-span-3 xl:row-span-2">
                    <Date dateString={postData.date} />
                </div>
                <div  className="prose lg:prose-xl " dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
        </Layout >
    )
}