import { TEMPLATE_REGISTRY } from './lib/template-registry';
import { resolveSiteData } from './lib/schema';

const template = TEMPLATE_REGISTRY['origin'];
const defaultSchema = template.defaultSchema('My Origin');

console.log("Default Schema Hero Props:", defaultSchema.pages[0].sections[0].props);

const resolved = resolveSiteData({ global: { templateSlug: 'origin' } }, 'My Origin');

console.log("Resolved Schema Hero Props:", resolved.pages[0].sections[0].props);
