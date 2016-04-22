
/* Usage: In your Addon:
 * 
 * js``` 
 * 
 * import additionnalLinks from 'ui/utils/additional-header-link';
 * additionnalLinks.addLink( 'myid-tabs', 'route.to.url.id', 'My Link label' )
 * 
 * ````
 */


class AdditionalHeaderLink {
  constructor() {
    this._links = [];
  }

  addLink(id, urlid, label) {
    let link = new TopLevelLink(id, urlid, label);
    this._links.push(link);
    return link;
  }

  get links() {
    return this._links;
  }

  getLinkIdWithSub() {
    return [];
    // return this._links.filter(function(e) {
    //   return e.hasSubLinks;
    // }).map(function(e) {
    //   return e.id;
    // });
  }

  getLinkIdWithoutSub() {
    return this._links.map(function(e) {
      return e.id;
    });;
  }

}

class LinkBase {
  constructor(urlid, label) {
    this.urlid = urlid;
    this.label = label;
  }
}

class TopLevelLink extends LinkBase {
  constructor(id, urlid, label) {
    super(urlid, label);
    this.id = id;
    //this._links = [];
  }

  // addSubLink(urlid, label) {
  //   this._links.push(new LinkBase(urlid, label));
  //   return this;
  // }

  // get hasSubLinks() {
  //   return this._links.length > 0;
  // }

  // get links() {
  //   return this._links;
  // }
}

const additionnalheaderlink = new AdditionalHeaderLink();

export default additionnalheaderlink;

