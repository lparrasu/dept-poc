import { CanvasClient } from "@uniformdev/canvas";
import { Composition } from "@uniformdev/canvas-react";
import LayoutCanvas from "../src/components/LayoutCanvas";
import { EnhancerBuilder, enhance } from '@uniformdev/canvas';

import content from "../content/content.json";
import doEnhance from "../lib/enhancer";
import resolveRenderer from "../lib/resolveRenderer";

import {
  createContentstackEnhancer,
  CANVAS_CONTENTSTACK_PARAMETER_TYPES,
} from '@uniformdev/canvas-contentstack';
import contentstack from 'contentstack';

async function getComposition(slug) {
  const client = new CanvasClient({
    apiKey: process.env.UNIFORM_API_KEY,
    projectId: process.env.UNIFORM_PROJECT_ID,

  });

  const clientContentStack = contentstack.Stack({
    api_key: 'blt5a2e7bef85c976bd',
    delivery_token: 'cs405825e9439cf0bc04825730',
    environment: 'dev',
    region: contentstack.Region.EU,
  });

  const contentstackEnhancer = createContentstackEnhancer({ client: clientContentStack });

 

  const { composition } = await client.getCompositionBySlug({
    slug,
  });

  await enhance({
    composition,
    enhancers: new EnhancerBuilder().parameterType(
      CANVAS_CONTENTSTACK_PARAMETER_TYPES,
      contentstackEnhancer
    ),
    context: {},
  });

  const str = JSON.stringify(composition)

  console.log(str);

  return composition;
}



export async function getStaticProps() {
  const slug = "/";
  const topic = content.find((e) => e.url == slug);

  const composition = await getComposition(slug);

  await doEnhance(composition);

  //
  //Return props for the home page that
  //include the composition and content
  //required by the page components.
  return {
    props: {
      composition,
      fields: topic.fields,
    },
  };
}

export default function Home({ composition, fields }) {
  return (
    <Composition data={composition} resolveRenderer={resolveRenderer}>
      <LayoutCanvas composition={composition} fields={fields} />
    </Composition>
  );
}
