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
  const lastName = rest.join(' ') || ''

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  // ── Step 1: Create / upsert contact
  let contactId = null
  try {
    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone: number_whats_app,
        locationId: LOCATION_ID,
        source: 'VirtuPro Revenue Calculator Lead Magnet',
        tags: ['lead-magnet', 'revenue-calculator'],
        customFields: CG6GeFiqxFrpb5m9YVMl
          ? [{ key: 'contact.how_many_str_airbnb_properties_you_manage', field_value: CG6GeFiqxFrpb5m9YVMl }]
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
  if (contactId && CG6GeFiqxFrpb5m9YVMl) {
    try {
      const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: `Source: VirtuPro Revenue Calculator Lead Magnet\nProperties managed: ${CG6GeFiqxFrpb5m9YVMl}` }),
      })
      console.log('[calculator] note →', r.status)
    } catch (err) {
      console.error('[calculator] note threw:', err.message)
    }
  }

  // ── Step 3: Log form submission
  try {
    const submissionBody = {
      locationId: LOCATION_ID,
      formId: FORM_ID,
      contactId,
      fields: [
        { name: 'full_name',          value: full_name || '' },
        { name: 'email',              value: email || '' },
        { name: 'number_whats_app',   value: number_whats_app || '' },
        { name: 'CG6GeFiqxFrpb5m9YVMl', value: CG6GeFiqxFrpb5m9YVMl || '' },
      ],
    }
    const r = await fetch(`https://services.leadconnectorhq.com/forms/${FORM_ID}/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(submissionBody),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[submit-form] form submission →', r.status, JSON.stringify(data))
  } catch (err) {
    console.error('[submit-form] form submission threw:', err.message)
  }

  // Always return 200 — contact was created even if form submission log failed
  return res.status(200).json({ ok: true, contactId })
}
