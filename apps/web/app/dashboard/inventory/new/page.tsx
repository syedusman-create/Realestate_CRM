import Link from 'next/link'
import { createProject } from '../actions'

export default function NewProjectPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/dashboard/inventory">← Inventory</Link>
          <div className="eyebrow">PORTFOLIO</div>
          <h1>Add project</h1>
          <p className="muted">Create a shared property-master project. Configurations and unit inventory can be added after creation.</p>
        </div>
      </div>

      <form className="panel form-grid" action={createProject}>
        <label>Project name<input name="name" required placeholder="e.g. Prestige Lakeside Habitat" /></label>
        <label>Developer<input name="developer_name" placeholder="e.g. Prestige Group" /></label>
        <label>City<input name="city" placeholder="Bengaluru" /></label>
        <label>State<input name="state" defaultValue="Karnataka" /></label>
        <label>Property category<select name="property_category" defaultValue="primary_sale"><option value="primary_sale">Primary sale</option><option value="resale">Resale</option><option value="rental">Rental</option></select></label>
        <label>Property type<select name="property_type" defaultValue="apartment"><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="plot">Plot</option><option value="independent_house">Independent house</option><option value="row_house">Row house</option><option value="commercial">Commercial</option><option value="office">Office</option><option value="retail">Retail</option><option value="other">Other</option></select></label>
        <label>Status<select name="status" defaultValue="upcoming"><option value="upcoming">Upcoming</option><option value="pre_launch">Pre-launch</option><option value="launched">Launched</option><option value="under_construction">Under construction</option><option value="ready_to_move">Ready to move</option><option value="completed">Completed</option><option value="sold_out">Sold out</option><option value="inactive">Inactive</option></select></label>
        <label>Starting price (₹)<input name="price_min" inputMode="numeric" placeholder="10000000" /></label>
        <label>Maximum price (₹)<input name="price_max" inputMode="numeric" placeholder="25000000" /></label>
        <div className="form-actions"><Link className="button secondary" href="/dashboard/inventory">Cancel</Link><button className="button" type="submit">Create project</button></div>
      </form>
    </main>
  )
}
