export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { full_name, email, number_whats_app, CG6GeFiqxFrpb5m9YVMl } = req.body
  const GHL_API_KEY  = process.env.GHL_API_KEY
  const LOCATION_ID  = 'vLiQq0oLjfhklTrtgQUA'
  const FORM_ID      = 'fTUEHEcgFe5NVhXKnTFA'

  if (!GHL_API_KEY) {
    console.error('[submit-form] GHL_API_KEY env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const [firstName, ...rest] = (full_name || '').trim().split(' ')
  const lastName      = rest.join(' ') || ''
  const propertyCount = CG6GeFiqxFrpb5m9YVMl || ''
  const SOURCE        = 'VirtuPro Revenue Calculator Lead Magnet'

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  // ── Step 1: Create / upsert contact
  let contactId = null
  try {
    const tags = ['lead-magnet', 'revenue-calculator']
    if (propertyCount) tags.push(propertyCount)

    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone: number_whats_app,
        locationId: LOCATION_ID,
        source: SOURCE,
        tags,
        customFields: propertyCount
          ? [{ key: 'contact.how_many_str_airbnb_properties_you_manage', field_value: propertyCount }]
          : [],
      }),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[submit-form] contacts →', r.status, JSON.stringify(data))
    if (r.ok && data?.contact?.id) contactId = data.contact.id
    else if (!r.ok) console.error('[submit-form] contact creation failed:', r.status, text)
  } catch (err) {
    console.error('[submit-form] contacts threw:', err.message)
  }

  // ── Step 2: Note so property count is always readable
  if (contactId && propertyCount) {
    try {
      const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: `Source: ${SOURCE}\nProperties managed: ${propertyCount}` }),
      })
      console.log('[calculator] note →', r.status)
    } catch (err) {
      console.error('[calculator] note threw:', err.message)
    }
  }

  return res.status(200).json({ ok: true, contactId })
}
