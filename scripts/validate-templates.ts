import { TEMPLATE_REGISTRY } from '../lib/template-registry';

function validateTemplates() {
  console.log('Validating templates...');
  let hasErrors = false;

  for (const [key, template] of Object.entries(TEMPLATE_REGISTRY)) {
    if (key === 'default' && Object.keys(TEMPLATE_REGISTRY).length > 1) {
      continue;
    }

    console.log(`\nChecking template: ${key}`);
    const defaultSchema = template.defaultSchema('Test Site');

    if (!defaultSchema || !defaultSchema.pages) {
      console.error(`❌ Template ${key} has no pages in defaultSchema.`);
      hasErrors = true;
      continue;
    }

    const allProps: any[] = [];
    if (defaultSchema.global) {
      allProps.push({ type: 'GLOBAL', props: defaultSchema.global });
    }
    for (const page of defaultSchema.pages) {
      for (const section of page.sections || []) {
        allProps.push({ type: `Page: ${page.path} | Section: ${section.type}`, props: section.props });
      }
    }

    // Check all props for unresolved assets
    for (const item of allProps) {
      const props = item.props;
      if (!props) continue;
      
      for (const propKey of Object.keys(props)) {
        const lowerKey = propKey.toLowerCase();
        if (lowerKey.includes('image') || lowerKey.includes('logo') || lowerKey.includes('url') || lowerKey.includes('bg') || lowerKey.includes('icon') || lowerKey.includes('avatar')) {
          const val = props[propKey];
          if (typeof val === 'string' && val.trim() !== '') {
            if (!val.startsWith('http') && !val.startsWith('data:') && !val.startsWith('/')) {
              console.error(`❌ Template Asset Error in [${key}]:`);
              console.error(`   Location: ${item.type}`);
              console.error(`   Asset Key: ${propKey}`);
              console.error(`   Reference: "${val}"`);
              console.error(`   Reason: unresolved asset. Must be an absolute URL, data URI, or root-relative path.`);
              hasErrors = true;
            }
          }
        }
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ Validation failed. Unresolved template assets found.');
    process.exit(1);
  } else {
    console.log('\n✅ All templates validated successfully. No broken image references found.');
  }
}

validateTemplates();
